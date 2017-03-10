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

const mimeTypes = {
  folder: 'application/vnd.google-apps.folder'
}

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

const getToken = () => {
  return oauthGetAccessToken(googleDriveConfig, googleDriveOptions)
}

const refreshToken = (token: Token) => {
  return oauthRefreshToken(googleDriveConfig, token.refresh_token)
}

const getDrive = (token: Token) => {
  const auth = new google.auth.OAuth2()
  auth.setCredentials(token)

  return google.drive({version: 'v3', auth}) as google.drive.v3.Drive
}

interface Query {
  name: string
  isFolder?: boolean
}

const fileQuery = (drive: google.drive.v3.Drive, query: Query, pageToken: string | null = null): Promise<google.drive.v3.FileList> => {
  return new Promise<google.drive.v3.FileList>((resolve, reject) => {
    let q = `name = '${query.name}'`
    if (query.isFolder) {
      q += ` and mimeType = '${mimeTypes.folder}'`
    }
    drive.files.list(
      {
        q,
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(name, id)',
        pageToken
      } as any,
      (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      }
    )
  })
}

const findFiles = async (drive: google.drive.v3.Drive, query: Query): Promise<google.drive.v3.File[]> => {
  let files: google.drive.v3.File[] = []
  let nextPageToken = null
  do {
    const res: google.drive.v3.FileList = await fileQuery(drive, query, nextPageToken)
    files = [...files, ...res.files]
    nextPageToken = res.nextPageToken
  } while (nextPageToken)
  return files
}

const createFolderResource = (drive: google.drive.v3.Drive, name: string, parent?: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const resource: Partial<google.drive.v3.File> = {
      name,
      mimeType: mimeTypes.folder
    }

    if (parent) {
      resource.parents = [parent]
    }

    drive.files.create({
      resource,
      fields: 'id'
    } as any, (err, file) => {
      if (err) {
        reject(err)
      } else {
        resolve(file.id)
      }
    })
  })
}

const createFolder = async (token: Token, name: string, parent?: string): Promise<string> => {
  const drive = getDrive(token)
  const files = await findFiles(drive, {name, isFolder: true})
  if (files.length) {
    return files[0].id
  }
  return await createFolderResource(drive, name, parent)
}

export const googleDriveSyncProvider: SyncProvider = {
  id: 'GoogleDrive',
  title: messages.title,
  getToken,
  refreshToken,
}

export const test = async (token: Token) => {

  try {
    const id = await createFolder(token, 'foo', 'appDataFolder')
    console.log(id)
  } catch (ex) {
    console.error(ex)
  }

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
