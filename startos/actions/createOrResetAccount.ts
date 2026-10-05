import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { createOrResetUser, getRandomString } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  email: Value.text({
    name: i18n('Email'),
    description: i18n(
      'The email address the person signs in with. If no account uses it yet, one is created.',
    ),
    required: true,
    default: null,
    patterns: [utils.Patterns.email],
  }),
  name: Value.text({
    name: i18n('Name'),
    description: i18n(
      'The name shown in HeyForm. Only used when a new account is created.',
    ),
    required: false,
    default: null,
  }),
})

export const createOrResetAccount = sdk.Action.withInput(
  'create-or-reset-account',

  async ({ effects }) => ({
    name: i18n('Create or Reset Account'),
    description: i18n(
      'Create a HeyForm account for someone, or give an existing account a new random password. Works while sign-ups are disabled, and needs no email setup.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {},

  async ({ effects, input }) => {
    const email = input.email.trim().toLowerCase()
    const password = getRandomString(24)

    const outcome = await createOrResetUser(effects, {
      email,
      name: input.name?.trim() || email.split('@')[0],
      password,
    })
    await storeJson.merge(effects, { accountCreated: true })

    return {
      version: '1',
      title:
        outcome === 'created'
          ? i18n('Account Created')
          : i18n('Password Reset'),
      message:
        outcome === 'created'
          ? i18n(
              'Send these credentials to the person. They can change the password in their HeyForm account settings.',
            )
          : i18n('The account now signs in with this password.'),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Email'),
            description: null,
            value: email,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
