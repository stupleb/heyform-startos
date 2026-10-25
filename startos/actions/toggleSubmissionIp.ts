import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const toggleSubmissionIp = sdk.Action.withoutInput(
  'toggle-submission-ip',

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.submissionIp).const(effects)

    return {
      name: enabled
        ? i18n('Stop Storing Respondent IPs')
        : i18n('Store Respondent IPs'),
      description: enabled
        ? i18n(
            "HeyForm saves each respondent's IP address with their submission and shows it with the response. Run this action to stop saving it; submissions already saved keep theirs. HeyForm restarts to apply it.",
          )
        : i18n(
            "HeyForm doesn't save respondents' IP addresses, only a scrambled form of each one to limit repeat submissions. Run this action to save them with each submission again. HeyForm restarts to apply it.",
          ),
      warning: null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.submissionIp).once()
    await storeJson.merge(effects, { submissionIp: !enabled })
  },
)
