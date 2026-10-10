import { primaryUrl } from '../primaryUrl'
import { sdk } from '../sdk'
import { configureAi } from './configureAi'
import { configureSpamProtection } from './configureSpamProtection'
import { configureStripe } from './configureStripe'
import { createOrResetAccount } from './createOrResetAccount'
import { manageSmtp } from './manageSmtp'
import { toggleGoogleFonts } from './toggleGoogleFonts'
import { toggleSignups } from './toggleSignups'

export const actions = sdk.Actions.of()
  .addAction(createOrResetAccount)
  .addAction(toggleSignups)
  .addAction(primaryUrl.action)
  .addAction(manageSmtp)
  .addAction(toggleGoogleFonts)
  .addAction(configureAi)
  .addAction(configureStripe)
  .addAction(configureSpamProtection)
