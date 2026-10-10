import { i18n } from '../i18n'
import { primaryUrl } from '../primaryUrl'

export const primaryUrlTask = primaryUrl.setupTask('important', {
  reason: i18n(
    'Choose the address HeyForm works at. Signing in only works there, and share links and uploaded files use it.',
  ),
})
