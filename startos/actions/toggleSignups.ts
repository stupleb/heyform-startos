import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const toggleSignups = sdk.Action.withoutInput(
  'toggle-signups',

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.signups).const(effects)

    return {
      name: enabled ? i18n('Disable Sign-ups') : i18n('Enable Sign-ups'),
      description: enabled
        ? i18n(
            'Sign-ups are enabled: anyone who can reach HeyForm can create an account. Run this action to stop new sign-ups; existing accounts and workspace invite links keep working. HeyForm restarts to apply it.',
          )
        : i18n(
            'Sign-ups are disabled: new accounts are made with Create or Reset Account, or by people you invite to a workspace. Run this action to let anyone sign up from the HeyForm login page. HeyForm restarts to apply it.',
          ),
      warning: enabled
        ? null
        : i18n(
            'Anyone who can reach your HeyForm address will be able to create an account until you disable sign-ups again. HeyForm emails each new account a code to confirm its address, so set up SMTP first.',
          ),
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.signups).once()
    await storeJson.merge(effects, { signups: !enabled })
  },
)
