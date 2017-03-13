import * as crypto from 'crypto'
import * as fs from 'fs'
const debounce = require('lodash.debounce')
const MemoryStream = require('memorystream') as new () => MemoryStream
import * as path from 'path'
import * as zlib from 'zlib'
import { CurrentDb } from './index'

const getLastDumpSeq = async (dir: string): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err)
      }
      const seqs = files
        .map(parseFloat)
        .filter(x => !isNaN(x))
      resolve(Math.max(0, ...seqs))
    })
  })
}

export const dumpNextSequence = debounce(async (current: CurrentDb) => {
  const dir = path.join(current.syncFolder, current.localInfo.localId)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  const since = await getLastDumpSeq(dir)
  let info = await current.db.info()
  if (info.update_seq !== since) {
    const fileName = path.join(dir, `${info.update_seq}`)

    const memStream = new MemoryStream()
    memStream
      .pipe(zlib.createGzip())
      .pipe(crypto.createCipher('aes-256-ctr', new Buffer(current.localInfo.key, 'base64')))
      .pipe(fs.createWriteStream(fileName))

    console.log(`dumping ${since} -> ${info.update_seq} to ${fileName}...`)
    await current.db.dump(memStream, {since})
    console.log(`done`)
  }
}, 1000, { trailing: true, leading: false })
