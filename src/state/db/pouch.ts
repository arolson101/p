import * as PouchDB from 'pouchdb'

export { PouchDB }

const replicationStream = require('pouchdb-replication-stream')

PouchDB.plugin(require('pouchdb-adapter-node-websql'))
PouchDB.plugin(require('transform-pouch'))
PouchDB.plugin(require('pouch-resolve-conflicts'))

PouchDB.plugin(replicationStream.plugin)
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

const customOpenDatabase = require('websql/custom')
const SQLiteDatabase = require('websql/lib/sqlite/SQLiteDatabase')

const SQLiteDatabaseWithKey = (key?: string) =>
  class {
    _db: any
    constructor (name: string) {
      this._db = new SQLiteDatabase(name)
      if (key) {
        this._db.exec(
          [ { sql: `PRAGMA journal_mode=WAL;` },
            { sql: `PRAGMA page_size=4096;` },
            { sql: `PRAGMA key=${key};` },
            { sql: `SELECT count(*) from sqlite_master;` }
          ],
          false,
          (err: any, ret: any[]) => {
            if (err || ret[3].error) {
              console.log(ret[3].error)
              throw ret[3].error
            }
          }
        )
      }
    }

    exec (queries: any, readOnly: any, callback: any) {
      return this._db.exec(queries, readOnly, callback)
    }
  }

export const adapter = (key?: string) => ({
  adapter: 'websql',
  websql: customOpenDatabase(SQLiteDatabaseWithKey(key))
})
