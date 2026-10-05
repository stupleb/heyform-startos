import { sdk } from './sdk'

// StartOS stops HeyForm before a backup, so MongoDB's files are copied at rest. Valkey holds only logins and queued jobs.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('startos', 'uploads', 'db'),
)
