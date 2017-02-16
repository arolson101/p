declare namespace PouchDB {

  interface TransformOpts {
    incoming?: (doc: PouchDB.Core.Document<any>) => PouchDB.Core.Document<any>
    outgoing?: (doc: PouchDB.Core.Document<any>) => PouchDB.Core.Document<any>
  }

  interface Database<Content extends Core.Encodable> {
    transform(options: TransformOpts): void
  }
}
