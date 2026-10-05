import { sdk } from '../sdk'
import { setDependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { watchAccount } from './watchAccount'
import { watchPrimaryUrl } from './watchPrimaryUrl'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  setDependencies,
  actions,
  watchAccount,
  watchPrimaryUrl,
)

export const uninit = sdk.setupUninit(versionGraph)
