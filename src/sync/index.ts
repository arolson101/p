import { FormattedMessage } from 'react-intl'
import { fsSyncProvider } from './fsSync'
import { googleDriveSyncProvider } from './gdrive'

export interface FileInfo {
  name: string
  id?: string
  folder: string
  size?: number
}

export interface SyncProvider<Config> {
  id: string
  title: FormattedMessage.MessageDescriptor

  createConfig: () => Promise<Config>
  configNeedsUpdate: (config: Config) => boolean
  updateConfig: (config: Config) => Promise<Config>
  drawConfig: (config: any) => React.ReactElement<any>

  mkdir: (config: Config, dir: FileInfo) => Promise<FileInfo>
  list: (config: Config, folderId?: string) => Promise<FileInfo[]>
  get: (config: Config, id: string) => Promise<Buffer>
  put: (config: Config, fileInfo: FileInfo, data: Buffer) => Promise<FileInfo>
  del: (config: Config, id: string) => Promise<void>
}

export const syncProviders = [
  googleDriveSyncProvider,
  fsSyncProvider
]
