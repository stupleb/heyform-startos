import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'heyform',
  title: 'HeyForm',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/stupleb/heyform-startos',
  upstreamRepo: 'https://github.com/heyform/heyform',
  marketingUrl: 'https://heyform.net',
  donationUrl: null,
  description: { short, long },
  volumes: ['startos', 'uploads', 'db', 'valkey'],
  images: {
    heyform: {
      source: { dockerTag: 'heyform/community-edition:v3.0.3' },
      arch: ['x86_64', 'aarch64'],
    },
    // MongoDB 5.0 and later need ARMv8.2-A, so aarch64 excludes the Raspberry Pi 4.
    mongo: {
      source: { dockerTag: 'mongo:7.0.43' },
      arch: ['x86_64', 'aarch64'],
    },
    valkey: {
      source: { dockerTag: 'valkey/valkey:9.1.2-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
