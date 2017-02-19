import * as PouchDB from 'pouchdb'

export { PouchDB }

const replicationStream = require('pouchdb-replication-stream')

PouchDB.plugin(require('transform-pouch'))
PouchDB.plugin(require('pouch-resolve-conflicts'))

PouchDB.plugin(replicationStream.plugin)
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

export const adapter = (key?: string) => ({
  // adapter: 'websql',
  // websql: customOpenDatabase(SQLiteDatabaseWithKey(key))
})
