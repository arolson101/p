/// <reference types="pouchdb-core" />

declare namespace PouchDB {
    interface Database<Content extends {} = {}> {
      crypto (password: string): any
    }
}

declare module 'crypto-pouch' {
    const plugin: PouchDB.Plugin
    export = plugin
}
