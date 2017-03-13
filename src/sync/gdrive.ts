/// <reference path='../../node_modules/google-api-nodejs-tsd/dist/googleapis.oauth2.v2/googleapis.oauth2.v2.d.ts'/>
/// <reference path='../../node_modules/google-api-nodejs-tsd/dist/googleapis.drive.v3/googleapis.drive.v3.d.ts'/>

const MemoryStream = require('memorystream') as new (arg?: any, opts?: any) => MemoryStream
import { defineMessages } from 'react-intl'
import { Token, OAuthConfig, OAuthOptions, oauthGetAccessToken, oauthRefreshToken } from '../util/index'
import { SyncProvider, FileInfo } from './index'

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
  folder: 'application/vnd.google-apps.folder',
  binary: 'application/octet-stream'
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
  name?: string
  parent?: string
  isFolder?: boolean
}

const fileQuery = (drive: google.drive.v3.Drive, query: Query, pageToken: string | null = null): Promise<google.drive.v3.FileList> => {
  return new Promise<google.drive.v3.FileList>((resolve, reject) => {
    const qs: string[] = []
    if (query.name) {
      qs.push(`name = ${query.name}`)
    }
    if (query.isFolder) {
      qs.push(`mimeType = '${mimeTypes.folder}'`)
    }
    if (query.parent) {
      qs.push(`'${query.parent}' in parents`)
    }
    const q = qs.join(' and ')
    drive.files.list(
      {
        q,
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(name, id, size)',
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

const createFolderResource = (drive: google.drive.v3.Drive, name: string, parent?: string): Promise<google.drive.v3.File> => {
  return new Promise<google.drive.v3.File>((resolve, reject) => {
    const resource: Partial<google.drive.v3.File> = {
      name,
      mimeType: mimeTypes.folder
    }

    if (parent) {
      resource.parents = [parent]
    }

    drive.files.create(
      {
        resource,
        fields: 'id'
      } as any,
      (err, file) => {
        if (err) {
          reject(err)
        } else {
          resolve(file)
        }
      }
    )
  })
}

const uploadFile = (drive: google.drive.v3.Drive, fileInfo: FileInfo, mimeType: string): Promise<google.drive.v3.File> => {
  if (!fileInfo.data) {
    throw new Error('no data provided')
  }

  return new Promise<google.drive.v3.File>((resolve, reject) => {
    const resource: Partial<google.drive.v3.File> = {
      name: fileInfo.name,
      parents: [fileInfo.folder]
    }
    const body = new MemoryStream()
    const media = {
      mimeType,
      body
    }

    drive.files.create(
      {
        resource,
        media,
        fields: 'id, size'
      } as any,
      (err, file) => {
        if (err) {
          reject(err)
        } else {
          if (parseFloat(file.size) !== fileInfo.data!.length) {
            console.warn(`file ${fileInfo.name} (id ${file.id}) is ${file.size} on server but should be ${fileInfo.data!.length}!`)
          }
          resolve(file)
        }
      }
    )

    body.write(fileInfo.data!)
    body.end()
  })
}

const downloadFile = (drive: google.drive.v3.Drive, fileId: string): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const req = drive.files.get(
      {fileId, alt: 'media'} as any,
      (err, file) => {
        if (err) {
          reject(err)
        }
      }
    ) as NodeJS.ReadableStream

    const memStream = new MemoryStream(null, {readable: false})
    req.on('end', () => resolve(memStream.toBuffer()))
    req.on('error', (err: Error) => reject(err))
    req.pipe(memStream)
  })
}

const deleteFile = (drive: google.drive.v3.Drive, fileId: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    drive.files.delete(
      {
        fileId
      },
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

const toFileInfo = (file: google.drive.v3.File): FileInfo => ({
  name: file.name,
  id: file.id,
  folder: file.parents[0],
  size: parseFloat(file.size)
})

const mkdir = async (token: Token, dir: FileInfo): Promise<FileInfo> => {
  const drive = getDrive(token)
  const files = await findFiles(drive, {name: dir.name, isFolder: true, parent: dir.folder})
  if (files.length) {
    return toFileInfo(files[0])
  }
  const folder = await createFolderResource(drive, dir.name, dir.folder)
  return toFileInfo(folder)
}

const list = async (token: Token, folderId?: string): Promise<FileInfo[]> => {
  const drive = getDrive(token)
  const files = await findFiles(drive, {parent: folderId})
  return files.map(toFileInfo)
}

const get = async (token: Token, id: string): Promise<Buffer> => {
  const drive = getDrive(token)
  return await downloadFile(drive, id)
}

const put = async (token: Token, fileInfo: FileInfo): Promise<FileInfo> => {
  const drive = getDrive(token)
  const file = await uploadFile(drive, fileInfo, mimeTypes.binary)
  return toFileInfo(file)
}

const del = async (token: Token, id: string): Promise<void> => {
  const drive = getDrive(token)
  await deleteFile(drive, id)
}

export const googleDriveSyncProvider: SyncProvider = {
  id: 'GoogleDrive',
  title: messages.title,

  getToken,
  refreshToken,

  mkdir,
  list,
  get,
  put,
  del
}
