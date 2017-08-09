import * as crypto from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as R from 'ramda'
import { PouchDB, DbInterface, DbInfo } from 'imports'
import { levelcrypt } from './levelcrypt'

const ext = '.db'

const genLocalId = (name: string): string => {
  const hostname = os.hostname()
  const userInfo = os.userInfo()
  const random = crypto.randomBytes(4).toString('hex')
  return `${hostname.substr(0, 18)}-${userInfo.username.substr(0, 18)}-${name.substr(0, 18)}-${random}`
}

const createDb = (userData: string) => (name: string): DbInfo => {
  const location = path.join(userData, encodeURIComponent(name.trim()) + ext)
  const info: DbInfo = { name, location }
  return info
}

const openDb = (userData: string) => (info: DbInfo, password: string): PouchDB.Database<any> => {
  return new PouchDB(info.location, { password, adapter: 'leveldb', db: levelcrypt } as any)
}

const deleteDb = (userData: string) => (info: DbInfo): void => {
  rimraf(info.location)
}

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see http://stackoverflow.com/a/42505874/3027390
 */
const rimraf = (dirPath: string) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function (entry) {
      const entryPath = path.join(dirPath, entry)
      if (fs.lstatSync(entryPath).isDirectory()) {
        rimraf(entryPath)
      } else {
        fs.unlinkSync(entryPath)
      }
    })
    fs.rmdirSync(dirPath)
  }
}

const isDbFilename = R.test(new RegExp('\.' + ext + '$', 'i'))
const buildInfo = (userData: string) => (filename: string): DbInfo => ({
  name: decodeURIComponent(path.basename(filename, ext)),
  location: path.join(userData, filename)
})
const buildInfoCache = (userData: string) => R.pipe(
  R.filter(isDbFilename),
  R.map(buildInfo(userData)),
  R.sortBy((doc: DbInfo) => doc.name)
)

const listDbs = (userData: string) => (): DbInfo[] => {
  const files = fs.readdirSync(userData)
  const infos = buildInfoCache(userData)(files)
  return infos
}

export const dbLevelcrypt = (userData: string): DbInterface => ({
  genLocalId,
  openDb: openDb(userData),
  createDb: createDb(userData),
  deleteDb: deleteDb(userData),
  listDbs: listDbs(userData)
})
