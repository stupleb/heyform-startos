import { sdk } from '../sdk'
import { configureAi } from './configureAi'
import { configureSpamProtection } from './configureSpamProtection'
import { configureStripe } from './configureStripe'
import { createOrResetAccount } from './createOrResetAccount'
import { manageSmtp } from './manageSmtp'
import { setPrimaryUrl } from './setPrimaryUrl'
import { toggleGoogleFonts } from './toggleGoogleFonts'
import { toggleSignups } from './toggleSignups'

export const actions = sdk.Actions.of()
  .addAction(createOrResetAccount)
  .addAction(toggleSignups)
  .addAction(setPrimaryUrl)
  .addAction(manageSmtp)
  .addAction(toggleGoogleFonts)
  .addAction(configureAi)
  .addAction(configureStripe)
  .addAction(configureSpamProtection)
