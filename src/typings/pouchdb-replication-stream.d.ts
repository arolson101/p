/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-replication" />
/// <reference types="node" />

declare namespace PouchDB {

  type DumpReplicateKeys = 'batch_size' | 'batches_limit' | 'filter' | 'doc_ids' | 'query_params' | 'since' | 'view'
  type DumpOptions = Pick<Replication.ReplicateOptions, DumpReplicateKeys>

  interface Database<Content extends PouchDB.Core.Encodable> {
    dump(stream: NodeJS.WritableStream, opts?: DumpOptions): Promise<any>
    load(stream: NodeJS.ReadableStream): Promise<any>
  }


  interface Static {
      adapter(name: string, adapter: any): any;
  }
}

declare module 'pouchdb-replication-stream' {
    const plugin: PouchDB.Plugin;
    export = plugin;
}
