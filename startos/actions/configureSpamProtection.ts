import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

const inputSpec = InputSpec.of({
  recaptcha: Value.union({
    name: i18n('Google reCAPTCHA'),
    description: i18n(
      "Lets a form run an invisible reCAPTCHA check before it accepts answers. Create reCAPTCHA v3 keys at google.com/recaptcha/admin, listing your primary URL's domain.",
    ),
    default: 'disabled',
    variants: Variants.of({
      disabled: { name: i18n('Disabled'), spec: InputSpec.of({}) },
      enabled: {
        name: i18n('Enabled'),
        spec: InputSpec.of({
          siteKey: Value.text({
            name: i18n('Site Key'),
            required: true,
            default: null,
          }),
          secretKey: Value.text({
            name: i18n('Secret Key'),
            required: true,
            default: null,
            masked: true,
          }),
        }),
      },
    }),
  }),
  akismetKey: Value.text({
    name: i18n('Akismet API Key'),
    description: i18n(
      'Lets a form send its text answers to Akismet and set aside the ones it judges to be spam. Get a key at akismet.com. Leave empty to turn it off.',
    ),
    required: false,
    default: null,
    masked: true,
  }),
})

export const configureSpamProtection = sdk.Action.withInput(
  'configure-spam-protection',

  async ({ effects }) => ({
    name: i18n('Configure Spam Protection'),
    description: i18n(
      'Add Google reCAPTCHA and Akismet spam filtering for public forms. Each form then turns them on in its own settings. HeyForm restarts to apply it.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Integrations'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const { recaptcha, akismetKey } =
      (await storeJson
        .read((s) => ({ recaptcha: s.recaptcha, akismetKey: s.akismetKey }))
        .once()) ?? {}
    return {
      recaptcha: recaptcha
        ? { selection: 'enabled' as const, value: recaptcha }
        : { selection: 'disabled' as const, value: {} },
      akismetKey: akismetKey || null,
    }
  },

  async ({ effects, input }) =>
    storeJson.merge(effects, {
      recaptcha:
        input.recaptcha.selection === 'enabled'
          ? {
              siteKey: input.recaptcha.value.siteKey.trim(),
              secretKey: input.recaptcha.value.secretKey.trim(),
            }
          : null,
      akismetKey: input.akismetKey?.trim() ?? '',
    }),
)
