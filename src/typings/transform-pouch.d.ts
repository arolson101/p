declare namespace PouchDB {

  interface TransformOpts {
    incoming?: (doc: Core.Document<any>) => Core.Document<any>
    outgoing?: (doc: Core.Document<any>) => Core.Document<any>
  }

  interface Database<Content extends {} = {}> {
    transform (options: TransformOpts): void
  }
}
