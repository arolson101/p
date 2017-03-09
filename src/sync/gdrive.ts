/// <reference path='../../node_modules/google-api-nodejs-tsd/dist/googleapis.oauth2.v2/googleapis.oauth2.v2.d.ts'/>
/// <reference path='../../node_modules/google-api-nodejs-tsd/dist/googleapis.drive.v3/googleapis.drive.v3.d.ts'/>

import { defineMessages } from 'react-intl'
import { Token, OAuthConfig, OAuthOptions, oauthGetAccessToken, oauthRefreshToken } from '../util/index'
import { SyncProvider } from './index'

const google = require<google.GoogleApis>('googleapis')
// const GoogleAuth = require('google-auth-library')
// const google = {
//   auth: new GoogleAuth(),
//   drive: require</*google.drive.v3.Drive*/ any>('googleapis/apis/drive/v3')
// }

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
  },
}

export const test = (token: Token) => {
  const auth = new google.auth.OAuth2()
  auth.setCredentials(token)

  const drive = google.drive({version: 'v3', auth}) as google.drive.v3.Drive
  drive.files.list({
    spaces: 'appDataFolder',
    pageSize: 10,
    // fields: "nextPageToken, files(id, name)"
  },
  function (err: Error, response) {
    if (err) {
      console.log('The API returned an error: ' + err)
      return
    }
    console.log(response)
    let files = response.files
    if (files.length === 0) {
      console.log('No files found.')
    } else {
      console.log('Files:')
      for (let i = 0; i < files.length; i++) {
        let file = files[i]
        console.log('%s (%s)', file.name, file.id)
      }
    }
  })
}
