import * as crypto from 'crypto'
import * as levelup from 'levelup'
import { KeyDoc, createKeyDoc, decryptMasterKeyDoc } from 'util/index'

const updown = require('level-updown')

const keyDocKey = 'local/keyDoc'

const getDoc = <T>(db: levelup.LevelUp, key: string) => {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(key, (error, value: any) => {
      if (error) {
        resolve(undefined)
      } else {
        try {
          const t = JSON.parse(value) as T
          resolve(t)
        } catch (err) {
          resolve(undefined)
        }
      }
    })
  })
}

const putDoc = (db: levelup.LevelUp, key: string, value: any) => {
  return new Promise<void>((resolve, reject) => {
    db.put(key, JSON.stringify(value), { sync: true }, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

const closeDb = (db: levelup.LevelUp) => {
  return new Promise<void>((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

const openLevelDb = async (opts: Options, baseDb: levelup.LevelUp, password: string): Promise<any> => {
  try {
    let keyDoc = await getDoc<KeyDoc>(baseDb, keyDocKey)
    if (keyDoc) {
      opts.key = decryptMasterKeyDoc(keyDoc, password)
    } else {
      const newDoc = createKeyDoc(password)
      opts.key = newDoc.masterKey
      await putDoc(baseDb, keyDocKey, newDoc.doc)
    }
  } catch (err) {
    await closeDb(baseDb)
    throw err
  }
}

interface Options {
  algorithm: string
  ivBytes: number
  key?: Buffer
}

export function levelcrypt (location: string) {

  let opts: Options = {
    algorithm: 'aes-256-cbc',
    ivBytes: 16,
    key: undefined
  }

  const encryptValue = function (data: any) {
    return encrypt(data, opts)
  }

  const decryptValue = function (data: any) {
    return decrypt(data, opts)
  }

  const postIterator = (iterator: any) => {
    iterator.extendWith({
      postNext: postNext
    })

    return iterator
  }

  const postNext = (err: any, key: any, value: any, callback: any, next: any) => {
    if (!err && value) { value = decryptValue(value) }
    next(err, key, value, callback)
  }

  const postGet = (key: any, options: any, err: any, value: any, callback: any, next: any) => {
    if (!err) { value = decryptValue(value) }
    next(key, options, err, value, callback)
  }

  const prePut = (key: any, value: any, options: any, callback: any, next: any) => {
    value = encryptValue(value)
    next(key, value, options, callback)
  }

  const preBatch = (array: any, options: any, callback: any, next: any) => {
    for (let i = 0; i < array.length; i++) {
      let row = array[i]
      if (row.type === 'put') {
        row.value = encryptValue(row.value)
      } else if (row.type === 'del') {
        row.value = new Buffer('0')
      }
    }

    next(array, options, callback)
  }

  const db = levelup(location, {
    keyEncoding: 'binary',
    valueEncoding: 'binary'
  })

  const ud = updown(db)
  ud.extendWith({
    postGet: postGet,
    postIterator: postIterator,
    prePut: prePut,
    preBatch: preBatch,
    open: (options: any, callback: any, next: any) => {
      db.open((err?: Error) => {
        if (err) {
          callback(err)
        } else {
          openLevelDb(opts, db, options.password).then(
            () => callback(),
            (err2: Error) => callback(err2)
          )
        }
      })
    }
  })
  return ud
}

const encrypt = (data: any, opts: Options) => {
  let iv = crypto.randomBytes(opts.ivBytes)
  let cipher = crypto.createCipheriv(opts.algorithm, opts.key, iv)
  let ciphertext = Buffer.concat([cipher.update(data), cipher.final()])
  let parts = [
    iv,
    ciphertext
  ]

  return serialize(parts)
}

const decrypt = (data: any, opts: Options) => {
  let parts = unserialize(data)
  if (parts.length !== 2) {
    return data
  }

  let iv = parts[0]
  let ciphertext = parts[1]

  let decipher = crypto.createDecipheriv(opts.algorithm, opts.key, iv)
  let m = decipher.update(ciphertext)
  data = Buffer.concat([m, decipher.final()]).toString()
  return data
}

const serialize = (buffers: any) => {
  let parts: any[] = []
  buffers.forEach((part: any) => {
    let len = Buffer.alloc(4)
    if (typeof part === 'string') { part = Buffer.from(part) }
    len.writeUInt32BE(part.length, 0)
    parts.push(len)
    parts.push(part)
  })

  return Buffer.concat(parts).toString('base64')
}

const unserialize = (buf: any) => {
  buf = Buffer.from(buf, 'base64')
  let parts = []
  let l = buf.length
  let idx = 0
  while (idx < l) {
    let dlen = buf.readUInt32BE(idx)
    idx += 4
    let start = idx
    let end = start + dlen
    let part = buf.slice(start, end)
    parts.push(part)
    idx += part.length
  }

  return parts
}
