import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import {
  mongoPort,
  mongoUri,
  rootCaPath,
  uiPort,
  uploadPath,
  valkeyPort,
} from './utils'

// One failed check stops every dependent (start-technologies#3803), so fail only after three misses in a row.
const tolerant = async (probe: () => Promise<boolean>) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await probe()) return true
    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }
  return false
}

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting HeyForm!'))

  const store = await storeJson
    .read((s) => ({
      sessionKey: s.sessionKey,
      formEncryptionKey: s.formEncryptionKey,
      signups: s.signups,
      googleFonts: s.googleFonts,
      smtp: s.smtp,
      ai: s.ai,
      stripe: s.stripe,
      recaptcha: s.recaptcha,
      akismetKey: s.akismetKey,
    }))
    .const(effects)
  if (!store?.sessionKey || !store.formEncryptionKey) {
    throw new Error(i18n('Generated secrets are missing from store.json'))
  }

  let smtp: T.SmtpValue | null = null
  if (store.smtp.selection === 'system') {
    smtp = await sdk.getSystemSmtp(effects).const()
    const customFrom = store.smtp.value.customFrom
    if (smtp && customFrom) smtp = { ...smtp, from: customFrom }
  } else if (store.smtp.selection === 'custom') {
    const { host, from, username, password, security } =
      store.smtp.value.provider.value
    smtp = {
      host,
      from,
      username,
      password: password ?? null,
      port: Number(security.value.port),
      security: security.selection,
    }
  }

  const heyformSub = sdk.SubContainer.of(
    effects,
    { imageId: 'heyform' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'uploads',
      subpath: null,
      mountpoint: uploadPath,
      readonly: false,
    }),
    'heyform',
  )
  const mongoSub = sdk.SubContainer.of(
    effects,
    { imageId: 'mongo' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'db',
      subpath: null,
      mountpoint: '/data/db',
      readonly: false,
    }),
    'mongo',
  )
  const valkeySub = sdk.SubContainer.of(
    effects,
    { imageId: 'valkey' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'valkey',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'valkey',
  )

  // Lets HeyForm reach HTTPS addresses on this server, such as an AI service, whose certificates chain to the StartOS root CA.
  await heyformSub.writeFile(rootCaPath, await sdk.getRootCa(effects))

  const env: Record<string, string> = {
    SESSION_KEY: store.sessionKey,
    FORM_ENCRYPTION_KEY: store.formEncryptionKey,
    MONGO_URI: mongoUri,
    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: String(valkeyPort),
    TRUST_PROXY: '1',
    APP_DISABLE_REGISTRATION: String(!store.signups),
    ENABLE_GOOGLE_FONTS: String(store.googleFonts),
    NODE_EXTRA_CA_CERTS: rootCaPath,
  }
  const homepageUrl = (await primaryUrl.bestUsable(effects).const())?.replace(
    /\/+$/,
    '',
  )
  if (homepageUrl) env.APP_HOMEPAGE_URL = homepageUrl
  if (smtp) {
    Object.assign(env, {
      SMTP_HOST: smtp.host,
      SMTP_PORT: String(smtp.port),
      SMTP_FROM: smtp.from,
      SMTP_USER: smtp.username ?? '',
      SMTP_PASSWORD: smtp.password ?? '',
      SMTP_SECURE: String(smtp.security === 'tls'),
      // HeyForm passes this value straight to rejectUnauthorized, so 'true' turns certificate checks on.
      SMTP_IGNORE_CERT: 'true',
    })
  }
  if (store.ai) {
    Object.assign(env, {
      OPENAI_BASE_URL: store.ai.baseUrl,
      // HeyForm will not call the API without a key; local OpenAI-compatible servers ignore it.
      OPENAI_API_KEY: store.ai.apiKey || 'none',
      OPENAI_GPT_MODEL: store.ai.model,
    })
  }
  if (store.stripe) {
    Object.assign(env, {
      STRIPE_PUBLISHABLE_KEY: store.stripe.publishableKey,
      STRIPE_SECRET_KEY: store.stripe.secretKey,
      STRIPE_CONNECT_CLIENT_ID: store.stripe.connectClientId,
    })
    if (store.stripe.webhookSecret) {
      env.STRIPE_WEBHOOK_SECRET_KEY = store.stripe.webhookSecret
    }
  }
  if (store.recaptcha) {
    Object.assign(env, {
      GOOGLE_RECAPTCHA_KEY: store.recaptcha.siteKey,
      GOOGLE_RECAPTCHA_SECRET: store.recaptcha.secretKey,
    })
  }
  if (store.akismetKey) env.AKISMET_KEY = store.akismetKey

  return sdk.Daemons.of(effects)
    .addDaemon('mongo', {
      subcontainer: mongoSub,
      exec: {
        command: sdk.useEntrypoint([
          'mongod',
          '--bind_ip',
          '127.0.0.1',
          '--port',
          String(mongoPort),
          '--wiredTigerCacheSizeGB',
          '0.25',
          '--quiet',
        ]),
      },
      ready: {
        display: null,
        // A mongosh ping opens several connections and logs each one; mongod binds its port only once it can serve.
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, mongoPort, {
            successMessage: i18n('The database is ready'),
            errorMessage: i18n('The database is not ready'),
          }),
      },
      requires: [],
    })
    .addDaemon('valkey', {
      subcontainer: valkeySub,
      exec: {
        command: sdk.useEntrypoint([
          'valkey-server',
          '--bind',
          '127.0.0.1',
          '--port',
          String(valkeyPort),
          '--appendonly',
          'yes',
          '--save',
          '',
        ]),
        // The image's entrypoint is tini, which reaps zombies only as PID 1.
        runAsInit: true,
      },
      ready: {
        display: null,
        fn: async () =>
          (await tolerant(
            async () =>
              (
                await valkeySub.exec(
                  ['valkey-cli', '-p', String(valkeyPort), 'ping'],
                  { timeout: 20_000 },
                )
              ).stdout
                .toString()
                .trim() === 'PONG',
          ))
            ? { result: 'success', message: null }
            : { result: 'starting', message: null },
      },
      requires: [],
    })
    .addDaemon('heyform', {
      subcontainer: heyformSub,
      exec: { command: sdk.useEntrypoint(), env },
      ready: {
        display: i18n('Web Interface'),
        // /health/ready answers 503 until HeyForm reaches both MongoDB and Valkey.
        fn: async () =>
          (await tolerant(() =>
            fetch(`http://127.0.0.1:${uiPort}/health/ready`, {
              signal: AbortSignal.timeout(10_000),
            }).then(
              (res) => res.ok,
              () => false,
            ),
          ))
            ? {
                result: 'success',
                message: i18n('The web interface is ready'),
              }
            : {
                result: 'failure',
                message: i18n('The web interface is not ready'),
              },
        gracePeriod: 60_000,
      },
      requires: ['mongo', 'valkey'],
    })
})
