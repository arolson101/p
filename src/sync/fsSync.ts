import * as fs from 'fs'
import * as path from 'path'
import { defineMessages } from 'react-intl'
import { Token, OAuthConfig, OAuthOptions, oauthGetAccessToken, oauthRefreshToken } from '../util/index'
import { SyncProvider, FileInfo } from './index'

const messages = defineMessages({
  title: {
    id: 'fsSync.message',
    defaultMessage: 'Filesystem'
  },
})

const fsToken: Token = {
  access_token: 'fs',
  refresh_token: 'fs',
  expires_in: 3600,
  token_type: 'fs'
}

const root = '~/p'

const getToken = (): Promise<Token> => {
  return Promise.resolve(fsToken)
}

const refreshToken = (token: Token): Promise<Token> => {
  return Promise.resolve(fsToken)
}

const mkdir = (token: Token, dir: FileInfo): Promise<FileInfo> => {
  return new Promise<FileInfo>((resolve, reject) => {
    const id = path.join(root, dir.folder || '', dir.name)
    fs.mkdir(id, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({...dir, id})
      }
    })
  })
}

const getSize = async (file: string): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats.size)
      }
    })
  })
}

const list = (token: Token, folderId?: string): Promise<FileInfo[]> => {
  return new Promise<FileInfo[]>((resolve, reject) => {
    fs.readdir(folderId || root, async (err, files) => {
      if (err) {
        reject(err)
      } else {
        const fileInfos: FileInfo[] = []
        for (let file in files) {
          const name = path.basename(file)
          const size = await getSize(file)
          fileInfos.push({name, size, id: file, folder: folderId})
        }
        resolve(fileInfos)
      }
    })
  })
}

const get = (token: Token, id: string): Promise<Buffer> => {
  return Promise.resolve(Buffer.from(''))
}

const put = (token: Token, fileInfo: FileInfo): Promise<FileInfo> => {
  return Promise.resolve({} as any)
}

const del = (token: Token, id: string): Promise<void> => {
  return Promise.resolve()
}


export const fsSyncProvider: SyncProvider = {
  id: 'fsSync',
  title: messages.title,

  getToken,
  refreshToken,

  mkdir,
  list,
  get,
  put,
  del
}
