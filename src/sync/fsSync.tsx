import * as fs from 'fs'
import * as path from 'path'
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { SyncConnectionFS } from '../docs/index'
import { SyncProvider, FileInfo } from './index'
import * as electron from 'electron'

const fsSyncId = 'fsSync'

const messages = defineMessages({
  title: {
    id: 'fsSync.message',
    defaultMessage: 'Filesystem'
  },
})

const createConfig = (): Promise<SyncConnectionFS> => {
  return new Promise<SyncConnectionFS>((resolve, reject) => {
    electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, (fileNames) => {
      if (!fileNames) {
        reject(new Error('no filename selected'))
      } else if (fileNames.length !== 1) {
        reject(new Error('only one path should be returned'))
      } else {
        resolve({provider: fsSyncId, root: fileNames[0]})
      }
    })
  })
}

const configNeedsUpdate = (config: SyncConnectionFS): boolean => {
  return false
}

const updateConfig = async (config: SyncConnectionFS): Promise<SyncConnectionFS> => {
  return config
}

const drawConfig = (config: SyncConnectionFS) => {
  return <span>fs: {config.root}</span>
}

const mkdir = (config: SyncConnectionFS, dir: FileInfo): Promise<FileInfo> => {
  return new Promise<FileInfo>((resolve, reject) => {
    const id = path.join(config.root, dir.folder, dir.name)
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

const list = (config: SyncConnectionFS, folderId?: string): Promise<FileInfo[]> => {
  return new Promise<FileInfo[]>((resolve, reject) => {
    const folder = folderId || ''
    const dir = path.join(config.root, folder)
    fs.readdir(dir, async (err, files) => {
      if (err) {
        reject(err)
      } else {
        const fileInfos: FileInfo[] = []
        for (let file in files) {
          const id = path.join(config.root, folder, file)
          const name = path.basename(file)
          const size = await getSize(file)
          fileInfos.push({name, id, folder, size})
        }
        resolve(fileInfos)
      }
    })
  })
}

const get = (config: SyncConnectionFS, id: string): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(id, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const put = (config: SyncConnectionFS, fileInfo: FileInfo, data: Buffer): Promise<FileInfo> => {
  const id = path.join(config.root, fileInfo.folder, fileInfo.name)
  return new Promise<FileInfo>((resolve, reject) => {
    fs.writeFile(id, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({...fileInfo, id})
      }
    })
  })
}

const del = (config: SyncConnectionFS, id: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(id, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const fsSyncProvider: SyncProvider<SyncConnectionFS> = {
  id: fsSyncId,
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
