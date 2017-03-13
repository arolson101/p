import { FormattedMessage } from 'react-intl'
import { googleDriveSyncProvider } from './gdrive'
import { Token } from '../util/index'

export interface FileInfo {
  name: string
  id?: string
  folder: string
  size?: number
  data?: Buffer
}

export interface SyncProvider {
  id: string
  title: FormattedMessage.MessageDescriptor

  getToken: () => Promise<Token>
  refreshToken: (token: Token) => Promise<Token>

  mkdir: (token: Token, dir: FileInfo) => Promise<FileInfo>
  list: (token: Token, folderId?: string) => Promise<FileInfo[]>
  get: (token: Token, id: string) => Promise<Buffer>
  put: (token: Token, fileInfo: FileInfo) => Promise<FileInfo>
  del: (token: Token, id: string) => Promise<void>
}

export const syncProviders = [
  googleDriveSyncProvider
]
