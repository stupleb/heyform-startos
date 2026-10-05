import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { getRandomString } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    // Never rotate these: SESSION_KEY encrypts login cookies, FORM_ENCRYPTION_KEY the tokens of forms being filled in.
    await storeJson.merge(effects, {
      sessionKey: getRandomString(64),
      formEncryptionKey: getRandomString(64),
    })
  } else {
    await storeJson.merge(effects, {})
  }
})
