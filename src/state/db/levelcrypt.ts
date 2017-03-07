
import * as crypto from 'crypto'
// const hydration = require('hydration')
const NodeBuffer = require('buffer').Buffer
const updown = require('level-updown')
// const leveldown = require('leveldown')
const levelup = require('levelup') as (hostname: string, options?: levelupOptions) => LevelUp

const getDoc = <T>(db: LevelUp, key: string) => {
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

const putDoc = (db: LevelUp, key: string, value: any) => {
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

const closeDb = (db: LevelUp) => {
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

interface KeyInfo {
  salt: string
  iterations: number
  keylen: number
  digest: string
}

interface CipherInfo {
  algorithm: string
  iv: string
}

interface EncryptedData {
  cipherText: string
  authTag: string
}

interface KeyDoc {
  keyInfo: KeyInfo
  cipherInfo: CipherInfo
  masterKeyData: EncryptedData
}

const keyDocKey = 'local/keyDoc'

const createKeyInfo = (): KeyInfo => {
  const salt = crypto.randomBytes(16).toString('base64')
  const iterations = 64000 + Math.trunc(Math.random() * 20000)
  const keylen = 32
  const digest = 'sha512'
  return { salt, iterations, keylen, digest }
}

const computeKey = (password: string, info: KeyInfo): Buffer => {
  const { salt, iterations, keylen, digest } = info
  return crypto.pbkdf2Sync(password, NodeBuffer.from(salt, 'base64'), iterations, keylen, digest)
}

const createCipherInfo = (): CipherInfo => {
  const algorithm = 'aes-256-gcm'
  const iv = crypto.randomBytes(16).toString('base64')
  return { algorithm, iv }
}

const createCipher = (key: Buffer, info: CipherInfo) => {
  const { algorithm, iv } = info
  return crypto.createCipheriv(algorithm, key, NodeBuffer.from(iv, 'base64'))
}

const createDecipher = (key: Buffer, info: CipherInfo) => {
  const { algorithm, iv } = info
  return crypto.createDecipheriv(algorithm, key, NodeBuffer.from(iv, 'base64'))
}

const encryptMasterKey = (key: Buffer, cipher: crypto.Cipher): EncryptedData => {
  const cipherText = NodeBuffer.concat([
    cipher.update(key),
    cipher.final()
  ]).toString('base64')
  const authTag = cipher.getAuthTag().toString('base64')
  return { cipherText, authTag }
}

const decryptMasterKey = (decipher: crypto.Decipher, masterKey: EncryptedData): Buffer => {
  decipher.setAuthTag(NodeBuffer(masterKey.authTag, 'base64'))
  const key = NodeBuffer.concat([
    decipher.update(NodeBuffer(masterKey.cipherText, 'base64')),
    decipher.final() // will throw if auth tag doesn't match
  ])
  return key
}

const createKeyDoc = (password: string) => {
  const keyBytes = 32
  const masterKey = crypto.randomBytes(keyBytes)

  const keyInfo = createKeyInfo()
  const passKey = computeKey(password, keyInfo)

  const cipherInfo = createCipherInfo()
  const cipher = createCipher(passKey, cipherInfo)

  const masterKeyData = encryptMasterKey(masterKey, cipher)

  const doc: KeyDoc = {
    keyInfo,
    cipherInfo,
    masterKeyData
  }
  return { masterKey, doc }
}

const decryptMasterKeyDoc = (doc: KeyDoc, password: string): Buffer => {
  const passKey = computeKey(password, doc.keyInfo)
  const decipher = createDecipher(passKey, doc.cipherInfo)
  const masterKey = decryptMasterKey(decipher, doc.masterKeyData)
  return masterKey
}

const openLevelDb = async (opts: any, baseDb: LevelUp, password: string): Promise<any> => {
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

export function levelcrypt (location: string) {

  const db = levelup(location, {
    keyEncoding: 'binary',
    valueEncoding: 'binary'
  } as any)
  const ud = updown(db)

  let opts = {
    algorithm: 'aes-256-cbc',
    ivBytes: 16,
    key: null
  }

  let encryptValue = function (data: any) {
    return encrypt(data, opts)
  }

  let decryptValue = function (data: any) {
    return decrypt(data, opts)
  }

  function hashKey (key: any) {
    let hash = sha256(key)
    if (!NodeBuffer.isBuffer(hash)) { hash = NodeBuffer.from(hash) }

    return hash
  }

  function postIterator (iterator: any) {
    iterator.extendWith({
      postNext: postNext
    })

    return iterator
  }

  function postNext (err: any, key: any, value: any, callback: any, next: any) {
    if (!err && value) { value = decryptValue(value) }

    next(err, key, value, callback)
  }

  function preHashKey (key: any, options: any, callback: any, next: any) {
    key = hashKey(key)
    next(key, options, callback)
  }

  function postGet (key: any, options: any, err: any, value: any, callback: any, next: any) {
    if (!err) { value = decryptValue(value) }

    next(key, options, err, value, callback)
  }

  function prePut (key: any, value: any, options: any, callback: any, next: any) {
    key = hashKey(key)
    value = encryptValue(value)
    next(key, value, options, callback)
  }

  function preBatch (array: any, options: any, callback: any, next: any) {
    for (let i = 0; i < array.length; i++) {
      let row = array[i]
      row.key = hashKey(row.key)
      if (row.type === 'put') {
        row.value = encryptValue(row.value)
      }
    }

    next(array, options, callback)
  }

  ud.extendWith({
    preGet: preHashKey,
    postGet: postGet,
    postIterator: postIterator,
    preDel: preHashKey,
    prePut: prePut,
    preBatch: preBatch,
    open: (options: any, callback: any, next: any) => {
      db.open((err?: Error) => {
        if (err) {
          callback(err)
        } else {
          openLevelDb(opts, db, options.password).then(
            () => {
              console.log('key retrieved: ', opts.key)
              callback()
            },
            (err2: Error) => callback(err2)
          )
        }
      })
    }
  })
  return ud
}

function sha256 (key: any) {
  return crypto.createHash('sha256').update(key).digest()
}

function encrypt (data: any, opts: any) {
  let salt = !opts.key && (opts.salt || crypto.randomBytes(opts.saltBytes))
  let key = opts.key || crypto.pbkdf2Sync(opts.password, salt, opts.iterations, opts.keyBytes, opts.digest)
  let iv = opts.iv || crypto.randomBytes(opts.ivBytes)
  let cipher = crypto.createCipheriv(opts.algorithm, key, iv)
  let ciphertext = NodeBuffer.concat([cipher.update(data), cipher.final()])
  let parts = [
    iv,
    ciphertext
  ]

  if (salt) { parts.push(salt) }

  return serialize(parts)
}

function decrypt (data: any, opts: any) {
  let parts = unserialize(data)
  let iv = parts[0]
  let ciphertext = parts[1]
  let salt = parts[2]
  let key = opts.key
  if (!key) {
    key = crypto.pbkdf2Sync(opts.password, salt, opts.iterations, opts.keyBytes, opts.digest)
  }

  let decipher = crypto.createDecipheriv(opts.algorithm, key, iv)
  let m = decipher.update(ciphertext)
  data = NodeBuffer.concat([m, decipher.final()]).toString()
  return JSON.parse(data)
}

// function hydrate (entity: any) {
//   return hydration.hydrate(entity)
// }

// function dehydrate (entity: any) {
//   // if (Buffer.isBuffer(entity)) return entity
//   let data = hydration.dehydrate(entity)
//   return new Buffer(JSON.stringify(data))
// }

function serialize (buffers: any) {
  let parts: any[] = []
  let idx = 0
  buffers.forEach(function (part: any) {
    let len = NodeBuffer.alloc(4)
    if (typeof part === 'string') { part = NodeBuffer.from(part) }
    len.writeUInt32BE(part.length, 0)
    parts.push(len)
    idx += len.length
    parts.push(part)
    idx += part.length
  })

  return NodeBuffer.concat(parts).toString('base64')
}

function unserialize (buf: any) {
  buf = NodeBuffer.from(buf, 'base64')
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

// function assert (statement: any, errMsg: any) {
//   if (!statement) { throw new Error(errMsg || 'Assertion failed') }
// }

// function sha256 (key: any) {
//   return crypto.createHash('sha256').update(key).digest()
// }

// function normalizeOpts (_opts: any) {
//   let opts: any = {}
//   let defaults: any = _opts.key ? DEFAULT_KEY_BASED_OPTS : DEFAULT_PASSWORD_BASED_OPTS
//   for (let p in defaults) {
//     opts[p] = p in _opts ? _opts[p] : defaults[p]
//   }

//   assert(typeof opts.algorithm === 'string', 'Expected string "algorithm"')
//   assert(typeof opts.ivBytes === 'number', 'Expected number "ivBytes"')

//   if (!opts.key) {
//     assert(typeof opts.keyBytes === 'number', 'Expected number "keyBytes"')
//     assert(typeof opts.iterations === 'number', 'Expected number "iterations"')
//     assert(typeof opts.password === 'string' || Buffer.isBuffer(opts.password), 'Expected string or Buffer "password"')
//     assert(typeof opts.digest === 'string', 'Expected string "digest"')

//     if (opts.salt) {
//       assert(Buffer.isBuffer(opts.salt), 'Expected Buffer "salt"')
//       // if global salt is provided don't recalculate key every time
//       if (!opts.key) {
//         opts.key = crypto.pbkdf2Sync(opts.password, opts.salt, opts.iterations, opts.keyBytes, opts.digest)
//       }
//     } else {
//       assert(typeof opts.saltBytes === 'number', 'Expected number "saltBytes"')
//     }
//   }

//   return opts
// }
