import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { DocCache, DbView, Bill, Budget } from './'

export interface Category {
  name: string
  amount: number
}

export namespace Category {
  export type Id = ':categoryId' | 'create' | makeid
  export type DocId = 'category/:budgetId/:categoryId'
  export type Doc = PouchDB.Core.Document<Category> & { _id: DocId; _rev?: string }
  export interface Params { budgetId: Budget.Id, categoryId: Id }
  export const docId = docURI.route<Params, DocId>('category/:budgetId/:categoryId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type View = {
    doc: Doc
    bills: Bill.View[]
  }

  export const buildView = (doc: Doc, cache: DocCache): View => {
    return ({
      doc,
      bills: []
    })
  }

  export const linkView = (view: View, views: DbView) => {
    view.bills = views.bills.filter(bill => bill.doc.category === view.doc._id)
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (budget: Budget.Doc, category: Category, lang: string): Doc => {
    const budgetId = Budget.idFromDocId(budget._id)
    const categoryId = makeid(category.name, lang)
    const _id = docId({ budgetId, categoryId })
    return { _id, ...category }
  }
}
