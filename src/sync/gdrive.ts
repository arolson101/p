import { defineMessages } from 'react-intl'
import { Token, OAuthConfig, OAuthOptions, oauthGetAccessToken, oauthRefreshToken } from '../util/index'
import { SyncProvider } from './index'

const messages = defineMessages({
  title: {
    id: 'gdrive.message',
    defaultMessage: 'Google Drive'
  },
})

const googleDriveConfig: OAuthConfig = {
  clientId: '229251597879-ppen6bj39j1bggbglg2e50sp7an7ucb4.apps.googleusercontent.com',
  clientSecret: '5bJOuosHJhtS1_njehD8CDn6',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
  tokenUrl: 'https://accounts.google.com/o/oauth2/token',
  useBasicAuthorizationHeader: false,
  redirectUri: 'http://localhost'
}

const googleDriveOptions: OAuthOptions = {
  scope: 'https://www.googleapis.com/auth/drive.appfolder',
  accessType: 'offline'
}

export const googleDriveSyncProvider: SyncProvider = {
  id: 'GoogleDrive',
  title: messages.title,

  getToken: () => {
    return oauthGetAccessToken(googleDriveConfig, googleDriveOptions)
  },

  refreshToken: (token: Token) => {
    return oauthRefreshToken(googleDriveConfig, token.refresh_token)
  }
}
