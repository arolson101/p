import * as crypto from 'crypto'
// const debounce = require('lodash.debounce')
const MemoryStream = require('memorystream') as new (arg?: any, opts?: any) => MemoryStream
import * as zlib from 'zlib'
import { SyncConnection } from '../../docs/index'
import { AppThunk, ThunkFcn, pushChanges } from '../../state/index'
import { syncProviders } from '../../sync/index'
import { KeyDoc, createKeyDoc, decryptMasterKeyDoc } from '../../util/index'
// import { CurrentDb } from './index'

const indexFileName = 'p.key'

// const getLastDumpSeq = async (dir: string): Promise<number> => {
//   return new Promise<number>((resolve, reject) => {
//     fs.readdir(dir, (err, files) => {
//       if (err) {
//         reject(err)
//       }
//       const seqs = files
//         .map(parseFloat)
//         .filter(x => !isNaN(x))
//       resolve(Math.max(0, ...seqs))
//     })
//   })
// }

// export const dumpNextSequence = debounce(async (current: CurrentDb) => {
//   const dir = path.join(current.syncFolder, current.localInfo.localId)
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir)
//   }

//   const since = await getLastDumpSeq(dir)
//   let info = await current.db.info()
//   if (info.update_seq !== since) {
//     const fileName = path.join(dir, `${info.update_seq}`)

//     const memStream = new MemoryStream()
//     memStream
//       .pipe(zlib.createGzip())
//       .pipe(crypto.createCipher('aes-256-ctr', new Buffer(current.localInfo.key, 'base64')))
//       .pipe(fs.createWriteStream(fileName))

//     console.log(`dumping ${since} -> ${info.update_seq} to ${fileName}...`)
//     await current.db.dump(memStream, {since})
//     console.log(`done`)
//   }
// }, 1000, { trailing: true, leading: false })

type RunSyncArgs = { config: SyncConnection.Doc }
export namespace runSync { export type Fcn = ThunkFcn<RunSyncArgs, void> }
export const runSync: AppThunk<RunSyncArgs, void> = ({config}) =>
  async (dispatch, getState): Promise<void> => {
    const { db: { current } } = getState()
    if (!current) {
      throw new Error('no open db')
    }

    const otherSyncs = { ...config.otherSyncs }
    const finish = (state: SyncConnection.State, message?: string) => {
      const lastAttempt = new Date().valueOf()
      const doc = { ...config, state, message, lastAttempt, otherSyncs }
      if (state === 'OK') {
        doc.lastSuccess = lastAttempt
      }
      dispatch(pushChanges({docs: [doc]}))
    }

    try {
      const provider = syncProviders.find(p => p.id === config.provider)
      if (!provider) {
        throw new Error(`unknown provider ${config.provider}`)
      }

      if (provider.configNeedsUpdate(config)) {
        config = await provider.updateConfig(config) as SyncConnection.Doc
      }

      if (!config.password) {
        finish('ERR_PASSWORD')
        return
      }

      const fileInfos = await provider.list(config)

      // get index file contents
      let indexFileInfo = fileInfos.find(info => info.name === indexFileName)
      let indexFileContents: KeyDoc

      // create new index
      if (!indexFileInfo) {
        const doc = createKeyDoc(config.password)
        indexFileContents = doc.doc
        const indexFileBuffer = Buffer.from(JSON.stringify(indexFileContents))
        // upload it
        indexFileInfo = await provider.put(
          config,
          {
            name: indexFileName,
            folderId: '',
            isFolder: false
          },
          indexFileBuffer
        )
      }

      if (!indexFileInfo.id) {
        throw new Error(`index file ${indexFileName} does not have an id`)
      }

      // download existing index
      const indexFileBuffer = await provider.get(config, indexFileInfo.id)
      indexFileContents = JSON.parse(indexFileBuffer.toString())

      // attempt to decrypt with password; if doesn't decrypt, user has to fix
      let masterKey: Buffer
      try {
        masterKey = decryptMasterKeyDoc(indexFileContents, config.password)
      } catch (err) {
        finish('ERR_PASSWORD', err.message)
        return
      }

      // for every directory that's not ours, ingest new files
      const folders = fileInfos.filter(info => info.isFolder && info.name !== current.localInfo.localId)
      for (let folder of folders) {
        const folderFileInfos = await provider.list(config, folder.id)
        folderFileInfos.sort((a, b) => parseFloat(a.name) - parseFloat(b.name))
        const last = otherSyncs[folder.name] || -1
        for (let file of folderFileInfos) {
          const seq = parseFloat(file.name)
          if (seq <= last) {
            console.log(`skipping import of ${folder.name}/${file.name} - older than ${last}`)
            continue
          }

          if (!file.id) {
            throw new Error(`file ${folder.name}/${file.name} does not have an id`)
          }

          const data = await provider.get(config, file.id)
          const out = new MemoryStream()
          const memStream = new MemoryStream()
          memStream
            .pipe(crypto.createDecipher('aes-256-ctr', masterKey))
            .pipe(zlib.createGunzip())
            .pipe(out)

          const load = current.db.load(out)
          memStream.write(data)
          memStream.end()

          await load
          console.log(`loaded {${folder.name}}/${file.name}`)
          otherSyncs[folder.name] = seq
        }
      }

      // create a folder for our dumps
      let ourFolder = fileInfos.find(info => info.isFolder && info.name === current.localInfo.localId)
      if (!ourFolder) {
        const name = current.localInfo.localId
        ourFolder = await provider.mkdir(config, { name, folderId: '', isFolder: true })
      }

      if (!ourFolder.id) {
        throw new Error(`folder ${ourFolder.name} does not have an id`)
      }

      // get latest change from our folder
      const ourFiles = await provider.list(config, ourFolder.id)
      const since = Math.max(0, ...ourFiles.map(file => parseFloat(file.name)))
      let info = await current.db.info()

      // write any changes made since then
      if (info.update_seq !== since) {
        const name = info.update_seq.toString()

        const output = new MemoryStream(null, { readable : false, writable: true })
        const memStream = new MemoryStream()
        memStream
          .pipe(zlib.createGzip())
          .pipe(crypto.createCipher('aes-256-ctr', masterKey))
          .pipe(output)

        console.log(`dumping from ${since} to ${info.update_seq}...`)
        await current.db.dump(memStream, {since})

        console.log(`dump completed; waiting for stream to finish...`)
        await finished(output)
        const data = output.toBuffer()

        console.log(`writing to {${ourFolder.id}}/${name}`)
        await provider.put(config, { name, folderId: ourFolder.id, isFolder: false }, data)
      }

      finish('OK')
    } catch (err) {
      finish('ERROR', err.message)
    }
  }

const finished = (stream: NodeJS.EventEmitter) => {
  return new Promise<void>((resolve, reject) => {
    stream.once('finish', () => {
      resolve()
    })
    stream.once('error', (err: Error) => {
      reject(err)
    })
  })
}
