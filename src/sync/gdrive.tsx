/// <reference path='../../node_modules/google-api-nodejs-tsd/dist/googleapis.oauth2.v2/googleapis.oauth2.v2.d.ts'/>
/// <reference path='../../node_modules/google-api-nodejs-tsd/dist/googleapis.drive.v3/googleapis.drive.v3.d.ts'/>

import * as React from 'react'
const MemoryStream = require('memorystream') as new (arg?: any, opts?: any) => MemoryStream
import { defineMessages, FormattedMessage, FormattedRelative } from 'react-intl'
import { OAuthConfig, OAuthOptions, oauthGetAccessToken, oauthRefreshToken } from 'util/index'
import { SyncConnection, SyncConnectionToken } from 'core/docs'
import { SyncProvider, FileInfo } from './'

const googleDriveSyncId = 'GoogleDrive'
const google = require<google.GoogleApis>('googleapis')
// const GoogleAuth = require('google-auth-library')
// const google = {
//   auth: new GoogleAuth(),
//   drive: require</*google.drive.v3.Drive*/ any>('googleapis/apis/drive/v3')
// }

type GDrive = google.drive.v3.Drive
type GFileList = google.drive.v3.FileList
type GFile = google.drive.v3.File

const messages = defineMessages({
  title: {
    id: 'gdrive.title',
    defaultMessage: 'Google Drive'
  },
  expires: {
    id: 'gdrive.expires',
    defaultMessage: 'Expires'
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

const getDrive = (config: SyncConnectionToken) => {
  const auth = new google.auth.OAuth2()
  auth.setCredentials(config.token)

  return google.drive({version: 'v3', auth}) as GDrive
}

interface Query {
  name?: string
  parent?: string
  isFolder?: boolean
}

const fileQuery = (drive: GDrive, query: Query, pageToken: string | null = null) => {
  return new Promise<GFileList>((resolve, reject) => {
    const qs: string[] = []
    if (query.name) {
      qs.push(`name = '${query.name}'`)
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
        fields: 'nextPageToken, files(name, id, size, parents, mimeType)',
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

const findFiles = async (drive: GDrive, query: Query): Promise<GFile[]> => {
  let files: GFile[] = []
  let nextPageToken = null
  do {
    const res: GFileList = await fileQuery(drive, query, nextPageToken)
    files = [...files, ...res.files]
    nextPageToken = res.nextPageToken
  } while (nextPageToken)
  return files
}

const createFolderResource = (drive: GDrive, name: string, parent?: string): Promise<GFile> => {
  return new Promise<GFile>((resolve, reject) => {
    const resource: Partial<GFile> = {
      name,
      mimeType: mimeTypes.folder,
      parents: [parent ? parent : 'appDataFolder']
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

const uploadFile = (drive: GDrive, fileInfo: FileInfo, data: Buffer, mimeType: string): Promise<GFile> => {
  return new Promise<GFile>((resolve, reject) => {
    const resource: Partial<GFile> = {
      name: fileInfo.name,
      parents: [fileInfo.folderId ? fileInfo.folderId : 'appDataFolder']
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
          if (parseFloat(file.size) !== data.length) {
            console.warn(`file ${fileInfo.name} (id ${file.id}) is ${file.size} on server but should be ${data.length}!`)
          }
          resolve(file)
        }
      }
    )

    body.write(data)
    body.end()
  })
}

const downloadFile = (drive: GDrive, fileId: string): Promise<Buffer> => {
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

const deleteFile = (drive: GDrive, fileId: string): Promise<void> => {
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

const toFileInfo = (file: GFile): FileInfo => ({
  name: file.name,
  id: file.id,
  folderId: file.parents && file.parents.length ? file.parents[0] : '',
  size: parseFloat(file.size),
  isFolder: (file.mimeType === mimeTypes.folder)
})

const createConfig = (): Promise<SyncConnectionToken> => {
  return new Promise<SyncConnectionToken>(async (resolve, reject) => {
    const token = await oauthGetAccessToken(googleDriveConfig, googleDriveOptions)
    resolve({
      provider: googleDriveSyncId,
      password: '',
      state: 'INIT',
      message: '',
      lastAttempt: 0,
      lastSuccess: 0,
      otherSyncs: {},

      token
    })
  })
}

const configNeedsUpdate = (config: SyncConnectionToken): boolean => {
  return SyncConnection.isExpired(config)
}

const updateConfig = async (config: SyncConnectionToken): Promise<SyncConnectionToken> => {
  const token = await oauthRefreshToken(googleDriveConfig, config.token.refresh_token)
  return { ...config, token }
}

const drawConfig = (config: SyncConnectionToken) => {
  return <span>
    <FormattedMessage {...messages.expires}/>
    {' '}
    <FormattedRelative value={config.token.expiry_date}/>
  </span>
}

const mkdir = async (config: SyncConnectionToken, dir: FileInfo): Promise<FileInfo> => {
  const drive = getDrive(config)
  const files = await findFiles(drive, {name: dir.name, isFolder: true, parent: dir.folderId})
  if (files.length) {
    return toFileInfo(files[0])
  }
  const folder = await createFolderResource(drive, dir.name, dir.folderId)
  return toFileInfo(folder)
}

const list = async (config: SyncConnectionToken, folderId?: string): Promise<FileInfo[]> => {
  const drive = getDrive(config)
  const files = await findFiles(drive, {parent: folderId})
  return files.map(toFileInfo)
}

const get = async (config: SyncConnectionToken, id: string): Promise<Buffer> => {
  const drive = getDrive(config)
  return await downloadFile(drive, id)
}

const put = async (config: SyncConnectionToken, fileInfo: FileInfo, data: Buffer): Promise<FileInfo> => {
  const drive = getDrive(config)
  const file = await uploadFile(drive, fileInfo, data, mimeTypes.binary)
  return toFileInfo(file)
}

const del = async (config: SyncConnectionToken, id: string): Promise<void> => {
  const drive = getDrive(config)
  await deleteFile(drive, id)
}

export const googleDriveSyncProvider: SyncProvider<SyncConnectionToken> = {
  id: googleDriveSyncId,
  title: messages.title,

  createConfig,
  configNeedsUpdate,
  updateConfig,
  drawConfig,

  mkdir,
  list,
  get,
  put,
  del
}
