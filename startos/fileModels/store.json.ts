import { FileHelper, smtpShape, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  sessionKey: z.string().catch(''),
  formEncryptionKey: z.string().catch(''),
  primaryUrl: z.string().catch(''),
  signups: z.boolean().catch(false),
  googleFonts: z.boolean().catch(false),
  smtp: smtpShape,
  ai: z
    .object({ baseUrl: z.string(), apiKey: z.string(), model: z.string() })
    .nullable()
    .catch(null),
  stripe: z
    .object({
      publishableKey: z.string(),
      secretKey: z.string(),
      connectClientId: z.string(),
      webhookSecret: z.string(),
    })
    .nullable()
    .catch(null),
  recaptcha: z
    .object({ siteKey: z.string(), secretKey: z.string() })
    .nullable()
    .catch(null),
  akismetKey: z.string().catch(''),
  // Set by Create or Reset Account; main must not read it reactively.
  accountCreated: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  shape,
)
