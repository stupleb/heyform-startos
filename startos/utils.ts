import { T, utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 9157
export const mongoPort = 27017
export const valkeyPort = 6379

export const uiHostId = 'ui-multi'
export const uiInterfaceId = 'ui'

export const serverDir = '/app/packages/server'
export const uploadPath = `${serverDir}/static/upload`
export const rootCaPath = '/app/startos-root-ca.crt'
export const mongoUri = `mongodb://127.0.0.1:${mongoPort}/heyform`

export const getRandomString = (len: number) =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len })

// Writes through HeyForm's own user schema and password hash, the same way its sign-up does.
const accountScript = `
const r = require('module').createRequire('${serverDir}/package.json')
r('reflect-metadata')
const mongoose = r('mongoose')
const { UserSchema } = r('./dist/src/model/user.model')
const { passwordHash } = r('./dist/src/utils/crypto')
;(async () => {
  const { HF_EMAIL: email, HF_NAME: name, HF_PASSWORD: password } = process.env
  await mongoose.connect(process.env.MONGO_URI)
  const User = mongoose.model('UserModel', UserSchema)
  const hash = await passwordHash(password, 10)
  const user = await User.findOne({ email })
  if (user) {
    await User.updateOne({ _id: user._id }, { password: hash, isEmailVerified: true })
  } else {
    await User.create({ name, email, password: hash, isEmailVerified: true })
  }
  await mongoose.disconnect()
  console.log(user ? 'reset' : 'created')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
`

export async function createOrResetUser(
  effects: T.Effects,
  user: { email: string; name: string; password: string },
): Promise<'created' | 'reset'> {
  return sdk.SubContainer.withTemp(
    effects,
    { imageId: 'heyform' },
    null,
    'manage-account',
    async (sub) => {
      const res = await sub.exec(['node', '-e', accountScript], {
        cwd: serverDir,
        env: {
          MONGO_URI: mongoUri,
          HF_EMAIL: user.email,
          HF_NAME: user.name,
          HF_PASSWORD: user.password,
        },
        timeout: 60_000,
      })
      const out = res.stdout.toString().trim()
      if (res.exitCode !== 0 || (out !== 'created' && out !== 'reset')) {
        throw new Error(
          `Account update failed: ${out} ${res.stderr.toString()}`.trim(),
        )
      }
      return out
    },
  )
}
