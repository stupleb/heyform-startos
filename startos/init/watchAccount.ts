import { createOrResetAccount } from '../actions/createOrResetAccount'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { manifest } from '../manifest'
import { sdk } from '../sdk'

// The SDK's default replay key for createOwnTask.
const accountTask = `${manifest.id}:${createOrResetAccount.id}`

// Important, not critical: a critical task would keep HeyForm stopped, and the action needs its database running.
export const watchAccount = sdk.setupOnInit(async (effects) => {
  if (await storeJson.read((s) => s.accountCreated).const(effects)) {
    await sdk.action.clearTask(effects, accountTask)
  } else {
    await sdk.action.createOwnTask(effects, createOrResetAccount, 'important', {
      reason: i18n(
        'Create your HeyForm account. Public sign-up is off, so this is how the first account is made.',
      ),
    })
  }
})
