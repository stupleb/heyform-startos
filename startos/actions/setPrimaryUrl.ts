import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUrls } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  primaryUrl: Value.dynamicSelect(async ({ effects }) => {
    const { all, preferred } = await uiUrls(effects).once()

    return {
      name: i18n('Primary URL'),
      description: i18n(
        'Pick the address you and the people filling in your forms can reach. To share forms beyond your network, add a public domain to HeyForm first.',
      ),
      values: Object.fromEntries(all.map((url) => [url, url])),
      default: preferred ?? '',
    }
  }),
})

export const setPrimaryUrl = sdk.Action.withInput(
  'set-primary-url',

  async ({ effects }) => ({
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose the address HeyForm works at. Signing in only works at this address, and share links and uploaded files use it. A running HeyForm restarts to apply it.',
    ),
    warning: (await storeJson.read((s) => s.primaryUrl).const(effects))
      ? i18n(
          'Images and files uploaded before the change keep pointing at the old address, so they stop loading if it goes away.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const stored = await storeJson.read((s) => s.primaryUrl).once()
    const { all } = await uiUrls(effects).once()
    return { primaryUrl: stored && all.includes(stored) ? stored : undefined }
  },

  async ({ effects, input }) =>
    storeJson.merge(effects, { primaryUrl: input.primaryUrl }),
)
