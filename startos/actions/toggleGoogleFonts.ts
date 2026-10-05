import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const toggleGoogleFonts = sdk.Action.withoutInput(
  'toggle-google-fonts',

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.googleFonts).const(effects)

    return {
      name: enabled
        ? i18n('Disable Google Fonts')
        : i18n('Enable Google Fonts'),
      description: enabled
        ? i18n(
            "Google Fonts are enabled: forms render in the font their theme names, loaded from Google by each visitor's browser. Run this action to use the visitor's system fonts instead. HeyForm restarts to apply it.",
          )
        : i18n(
            "Google Fonts are disabled: forms render in the visitor's system fonts and no browser contacts Google. Run this action to render each form in the font its theme names. HeyForm restarts to apply it.",
          ),
      warning: enabled
        ? null
        : i18n(
            "Every visitor's browser will load fonts from fonts.googleapis.com, which tells Google their IP address.",
          ),
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const enabled = await storeJson.read((s) => s.googleFonts).once()
    await storeJson.merge(effects, { googleFonts: !enabled })
  },
)
