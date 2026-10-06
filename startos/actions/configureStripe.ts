import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

const stripeAddress = async (path: string) => {
  const primaryUrl = await storeJson
    .read((s) => s.primaryUrl.replace(/\/+$/, ''))
    .once()
  return primaryUrl && primaryUrl + path
}

const inputSpec = InputSpec.of({
  stripe: Value.union({
    name: i18n('Stripe Payments'),
    description: i18n(
      'Let forms take card payments through Stripe Connect. Each form then connects a Stripe account in its form editor.',
    ),
    default: 'disabled',
    variants: Variants.of({
      disabled: { name: i18n('Disabled'), spec: InputSpec.of({}) },
      enabled: {
        name: i18n('Enabled'),
        spec: InputSpec.of({
          publishableKey: Value.text({
            name: i18n('Publishable Key'),
            description: i18n(
              'From Stripe Dashboard → Developers → API keys. Starts with pk_.',
            ),
            required: true,
            default: null,
          }),
          secretKey: Value.text({
            name: i18n('Secret Key'),
            description: i18n('From the same page. Starts with sk_.'),
            required: true,
            default: null,
            masked: true,
          }),
          connectClientId: Value.dynamicText(async () => {
            const url = await stripeAddress('/connect/stripe/callback')
            return {
              name: i18n('Connect Client ID'),
              description: i18n(
                'From Stripe Dashboard → Settings → Connect → Onboarding options → OAuth, after setting up Connect and enabling OAuth for Standard accounts. Stripe no longer recommends OAuth for new platforms, and a new account may not be offered it. Starts with ca_.',
              ),
              footnote: url
                ? i18n(
                    "Redirect URI to put first in Stripe's OAuth settings: ${url}",
                    {
                      url,
                    },
                  )
                : i18n(
                    'Set a primary URL to see the address to enter in Stripe.',
                  ),
              required: true,
              default: null,
            }
          }),
          webhookSecret: Value.dynamicText(async () => {
            const url = await stripeAddress('/payment/intent/webhook')
            return {
              name: i18n('Webhook Signing Secret'),
              description: i18n(
                'From the webhook endpoint you add in Stripe for HeyForm. Starts with whsec_. Until it is set, payments go through but submissions do not record their receipt.',
              ),
              footnote: url
                ? i18n(
                    'Webhook endpoint to add in Stripe, for payment_intent.succeeded events on connected accounts: ${url}',
                    { url },
                  )
                : i18n(
                    'Set a primary URL to see the address to enter in Stripe.',
                  ),
              required: false,
              default: null,
              masked: true,
            }
          }),
        }),
      },
    }),
  }),
})

export const configureStripe = sdk.Action.withInput(
  'configure-stripe',

  async ({ effects }) => ({
    name: i18n('Configure Stripe'),
    description: i18n(
      'Add card payment fields to forms. Needs a Stripe Connect platform with OAuth and a public HTTPS primary URL. HeyForm restarts to apply it.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Integrations'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const stripe = await storeJson.read((s) => s.stripe).once()
    return {
      stripe: stripe
        ? { selection: 'enabled' as const, value: stripe }
        : { selection: 'disabled' as const, value: {} },
    }
  },

  async ({ effects, input }) =>
    storeJson.merge(effects, {
      stripe:
        input.stripe.selection === 'enabled'
          ? {
              publishableKey: input.stripe.value.publishableKey.trim(),
              secretKey: input.stripe.value.secretKey.trim(),
              connectClientId: input.stripe.value.connectClientId.trim(),
              webhookSecret: input.stripe.value.webhookSecret?.trim() ?? '',
            }
          : null,
    }),
)
