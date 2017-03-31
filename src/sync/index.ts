import { FormattedMessage } from 'react-intl'
import { fsSyncProvider } from './fsSync'
import { googleDriveSyncProvider } from './gdrive'
import { SyncConnection } from '../docs/index'

export interface FileInfo {
  name: string
  id?: string
  folderId: string
  size?: number
  isFolder: boolean
}

export interface SyncProvider<Config> {
  id: string
  title: FormattedMessage.MessageDescriptor

  createConfig: () => Promise<Config>
  configNeedsUpdate: (config: Config) => boolean
  updateConfig: (config: Config) => Promise<Config>
  drawConfig: (config: Config) => React.ReactElement<any>

  mkdir: (config: Config, dir: FileInfo) => Promise<FileInfo>
  list: (config: Config, folderId?: string) => Promise<FileInfo[]>
  get: (config: Config, id: string) => Promise<Buffer>
  put: (config: Config, fileInfo: FileInfo, data: Buffer) => Promise<FileInfo>
  del: (config: Config, id: string) => Promise<void>
}

export const syncProviders: SyncProvider<SyncConnection>[] = [
  googleDriveSyncProvider,
  fsSyncProvider
]
