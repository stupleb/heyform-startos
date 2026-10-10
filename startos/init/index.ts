import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { watchAccount } from './watchAccount'
import { primaryUrlTask } from './primaryUrlTask'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  watchAccount,
  primaryUrlTask,
  dependencies,
)

export const uninit = sdk.setupUninit(versionGraph)
