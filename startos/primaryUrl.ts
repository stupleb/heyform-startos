import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiHostId, uiInterfaceId } from './utils'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-primary-url',
  hostId: uiHostId,
  interfaceId: uiInterfaceId,
  metadata: async ({ effects }) => ({
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
  field: {
    name: i18n('Primary URL'),
    description: i18n(
      'Pick the address you and the people filling in your forms can reach. To share forms beyond your network, add a public domain to HeyForm first.',
    ),
  },
  get: storeJson.read((s) => s.primaryUrl),
  set: (effects, url) => storeJson.merge(effects, { primaryUrl: url }),
  // HeyForm's session cookie is Secure, so only HTTPS addresses (and onions, which Tor Browser treats as secure) can hold a login.
  filter: { predicate: (h) => h.ssl || h.hostname.endsWith('.onion') },
})
