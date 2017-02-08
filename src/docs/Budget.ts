import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { DocCache } from './index'

export interface Budget {
  name: string
  group: string
}

export namespace Budget {
  export type Id = ':budgetId' | 'create' | makeid
  export type DocId = 'budget/:budgetId'
  export type Doc = TDocument<Budget, DocId>
  export interface Params { budgetId: Id }
  export const docId = docURI.route<Params, DocId>('budget/:budgetId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>

  export type View = {
    doc: Doc
  }

  export const buildView = (doc: Doc, cache: DocCache): View => {
    return ({
      doc
    })
  }

  export namespace routes {
    export const all = 'budgets'
    export const create = 'budget/create'
    export const view = 'budget/:budgetId'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }

    export const create = () => {
      return '/' + routes.create
    }

    export const view = (budget: Doc): string => {
      return '/' + budget._id
    }
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const idFromDocId = (budget: DocId): Id => {
    const bparts = docId(budget)
    if (!bparts) {
      throw new Error('not a budget id: ' + budget)
    }
    return bparts.budgetId
  }

  export const doc = (budget: Budget, lang: string): Doc => {
    const _id = docId({
      budgetId: makeid(budget.name, lang)
    })
    return { _id, ...budget }
  }
}
