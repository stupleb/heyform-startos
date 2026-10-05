import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, Variants } = sdk

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
          connectClientId: Value.text({
            name: i18n('Connect Client ID'),
            description: i18n(
              'From Stripe Dashboard → Settings → Connect → Onboarding options → OAuth, after enabling OAuth for Standard accounts. Starts with ca_.',
            ),
            required: true,
            default: null,
          }),
          webhookSecret: Value.text({
            name: i18n('Webhook Signing Secret'),
            description: i18n(
              'From the webhook endpoint you add in Stripe for HeyForm. Starts with whsec_. Until it is set, payments go through but submissions do not record their receipt.',
            ),
            required: false,
            default: null,
            masked: true,
          }),
        }),
      },
    }),
  }),
})

export const configureStripe = sdk.Action.withInput(
  'configure-stripe',

  async ({ effects }) => {
    const primaryUrl = (
      await storeJson.read((s) => s.primaryUrl).const(effects)
    )?.replace(/\/+$/, '')

    return {
      name: i18n('Configure Stripe'),
      description: primaryUrl
        ? i18n(
            'Add payment fields to forms with Stripe Connect. Stripe must reach HeyForm, so the primary URL has to be a public HTTPS address. In Stripe, set the OAuth redirect to ${redirectUrl} and add a webhook endpoint ${webhookUrl} for payment_intent.succeeded on connected accounts. HeyForm restarts to apply it.',
            {
              redirectUrl: `${primaryUrl}/connect/stripe/callback`,
              webhookUrl: `${primaryUrl}/payment/intent/webhook`,
            },
          )
        : i18n(
            'Add payment fields to forms with Stripe Connect. Set a primary URL first: the addresses to enter in Stripe are built from it. HeyForm restarts to apply it.',
          ),
      warning: null,
      allowedStatuses: 'any',
      group: i18n('Integrations'),
      visibility: 'enabled',
    }
  },

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
