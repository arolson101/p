import * as PouchDB from 'pouchdb-core'
import { DbInfo } from './state/db'

export { PouchDB, DbInfo }

export interface DbInterface {
  createDb: (name: string) => DbInfo
  openDb: (info: DbInfo, password: string) => PouchDB.Database<any>
  deleteDb: (info: DbInfo) => void
  listDbs: () => DbInfo[]
  genLocalId: (name: string) => string
}

export const defaultDbInterface: DbInterface = {
  createDb: (name: string): DbInfo => ({ name, location: name }),
  openDb: (info: DbInfo, password: string): PouchDB.Database<any> => new PouchDB(info.location),
  deleteDb: (info: DbInfo): void => undefined,
  listDbs: (): DbInfo[] => [],
  genLocalId: (name: string) => name,
}

export interface PStoreImports {
  db: DbInterface
}
