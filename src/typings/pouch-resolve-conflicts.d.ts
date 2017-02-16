declare namespace PouchDB {
  
  type ResolveFun<Content> = (a: Content, b: Content) => Content

  interface Database<Content extends Core.Encodable> {
    resolveConflicts(doc: Content, resolveFun: ResolveFun<Content>): void
  }
}
