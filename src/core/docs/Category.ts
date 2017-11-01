import * as docURI from 'docuri'
import { makeid, Lookup } from 'util/index'
import { Budget } from './'

export interface Category {
  name: string
  amount: number
}

export namespace Category {
  export type Id = ':categoryId' | 'create' | makeid
  export type DocId = 'category/:budgetId/:categoryId'
  export type Doc = TDocument<Category, DocId>
  export interface Params { budgetId: Budget.Id, categoryId: Id }
  export const docId = docURI.route<Params, DocId>('category/:budgetId/:categoryId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export interface View {
    doc: Doc
  }

  export const buildView = (doc: Doc): View => ({
    doc,
  })

  export const allDocs = {
    startkey: 'category/',
    endkey: 'category/\uffff',
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (budget: Budget.Doc, category: Category): Doc => {
    const budgetId = Budget.idFromDocId(budget._id)
    const categoryId = makeid()
    const _id = docId({ budgetId, categoryId })
    return { _id, ...category }
  }

  export const budgetId = (category: DocId): Budget.DocId => {
    const parts = docId(category)
    if (!parts) {
      throw new Error('invalid category docid: ' + category)
    }
    return Budget.docId(parts)
  }
}
