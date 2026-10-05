import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { uiUrls } from '../utils'

// The SDK's default replay key for createOwnTask.
const primaryUrlTask = `${manifest.id}:${setPrimaryUrl.id}`

export const watchPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const urls = await uiUrls(effects).const()
  const primaryUrl = await storeJson.read((s) => s.primaryUrl).const(effects)

  if (!primaryUrl) {
    if (urls.preferred) {
      await storeJson.merge(
        effects,
        { primaryUrl: urls.preferred },
        { allowWriteAfterConst: true },
      )
    }
  } else if (urls.all.includes(primaryUrl)) {
    await sdk.action.clearTask(effects, primaryUrlTask)
  } else if (urls.all.length) {
    // An empty list means the addresses aren't known yet, as early in boot.
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'important', {
      reason: i18n(
        'The address HeyForm works at is no longer available, so signing in and share links fail. Choose a new primary URL.',
      ),
    })
  }
})
