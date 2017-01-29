import * as PouchDB from 'pouchdb-browser'

export { PouchDB }

PouchDB.plugin(require<any>('pouchdb-adapter-node-websql'))

const customOpenDatabase = require<any>('websql/custom')
const SQLiteDatabase = require<any>('websql/lib/sqlite/SQLiteDatabase')

const SQLiteDatabaseWithKey = (key?: string) =>
  class {
    _db: any
    constructor(name: string) {
      this._db = new SQLiteDatabase(name)
      if (key) {
        this._db.exec(
          [ { sql: `PRAGMA key=${key};` },
            { sql: `SELECT count(*) from sqlite_master;` }
          ],
          false,
          (err: any, ret: any[]) => {
            if (err || ret[1].error) {
              console.log(ret[1].error)
              throw ret[1].error
            }
          }
        )
      }
    }

    exec(queries: any, readOnly: any, callback: any) {
      return this._db.exec(queries, readOnly, callback)
    }
  }

export const adapter = (key?: string) => ({
  adapter: 'websql',
  websql: customOpenDatabase(SQLiteDatabaseWithKey(key))
})
