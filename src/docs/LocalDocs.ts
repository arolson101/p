
export namespace LocalDoc {
  export type DocId = '_local/localDocs'
  export const DocId = '_local/localDocs'
  export interface Doc {
    _id: DocId
    ids: {
      [_id: string]: true
    }
  }

  export const isDocId = (id: string): boolean => {
    return id === DocId
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return doc._id === DocId
  }

  export const create = (): Doc => {
    return {
      _id: DocId,
      ids: {}
    }
  }

  export const updateIds = (localDocs: Doc, updated: AnyDocument[]): Doc => {
    const ids = { ...localDocs.ids }
    for (let doc of updated) {
      ids[doc._id] = true
    }
    return {
      ...localDocs,
      ids
    }
  }
}
