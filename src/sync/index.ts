import { FormattedMessage } from 'react-intl'
import { googleDriveSyncProvider } from './gdrive'
import { Token } from '../util/index'

export interface SyncProvider {
  id: string
  title: FormattedMessage.MessageDescriptor

  getToken: () => Promise<Token>
  refreshToken: (token: Token) => Promise<Token>
}

export const syncProviders = [
  googleDriveSyncProvider
]
