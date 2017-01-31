import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'

export interface Category {
  name: string
}

export namespace Category {
  export type Id = ':categoryId' | 'create' | makeid
  export type DocId = 'category/:categoryId'
  export type Doc = PouchDB.Core.Document<Category> & { _id: DocId; _rev?: string }
  export interface Params { categoryId: Id }
  export const docId = docURI.route<Params, DocId>('category/:categoryId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export namespace routes {
    export const create = 'category/create'
    export const read = 'category/:categoryId'
    export const update = 'category/:categoryId/update'
    export const del = 'category/:categoryId/delete'
  }

  export namespace to {
    export const create = () => {
      return '/' + routes.create
    }

    export const read = (category: Doc): string => {
      return '/' + category._id
    }

    export const update = (category: Doc): string => {
      return '/' + category._id + '/update'
    }

    export const del = (category: Doc): string => {
      return '/' + category._id + '/delete'
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (category: Category, lang: string): Doc => {
    const _id = docId({ categoryId: makeid(category.name, lang) })
    return { _id, ...category }
  }
}
