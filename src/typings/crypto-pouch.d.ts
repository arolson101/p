declare namespace PouchDB {
    interface Database<Content extends PouchDB.Core.Encodable> {
      crypto(password: string): any;
  }
}


declare module 'crypto-pouch' {
    const plugin: PouchDB.Plugin;
    export = plugin;
}
