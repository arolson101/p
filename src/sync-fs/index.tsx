import * as fs from 'fs'
import * as path from 'path'
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { SyncConnectionFS } from 'core/docs'
import { SyncProvider, FileInfo } from 'core/sync'
import * as electron from 'electron'

const fsSyncId = 'fsSync'

const messages = defineMessages({
  title: {
    id: 'fsSync.title',
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
        const config: SyncConnectionFS = {
          provider: fsSyncId,
          password: '',
          state: 'INIT',
          message: '',
          lastAttempt: 0,
          lastSuccess: 0,
          otherSyncs: {},

          root: fileNames[0]
        }
        resolve(config)
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
    const id = path.join(dir.folderId || config.root, dir.name)
    fs.mkdir(id, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve({...dir, folderId: dir.folderId, id})
      }
    })
  })
}

const stat = async (file: string): Promise<fs.Stats> => {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats)
      }
    })
  })
}

const list = (config: SyncConnectionFS, folderId?: string): Promise<FileInfo[]> => {
  return new Promise<FileInfo[]>((resolve, reject) => {
    const dir = folderId || config.root
    fs.readdir(dir, async (err, files) => {
      if (err) {
        reject(err)
      } else {
        const fileInfos: FileInfo[] = []
        for (let file of files) {
          const id = path.join(dir, file)
          const name = path.basename(file)
          const stats = await stat(id)
          const size = stats.size
          const isFolder = stats.isDirectory()
          fileInfos.push({name, id, folderId: dir, size, isFolder})
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
  const id = fileInfo.id || path.join(fileInfo.folderId || config.root, fileInfo.name)
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
