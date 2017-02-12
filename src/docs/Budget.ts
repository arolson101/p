import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import { DocCache, DbView, Bill, Category } from './'

export interface Budget {
  name: string
  categories: Category.DocId[]
}

export namespace Budget {
  export type Id = ':budgetId' | 'create' | makeid
  export type DocId = 'budget/:budgetId'
  export type Doc = TDocument<Budget, DocId>
  export interface Params { budgetId: Id }
  export const docId = docURI.route<Params, DocId>('budget/:budgetId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>
  export const icon = 'fa fa-signal'

  export type View = {
    doc: Doc
    categories: Category.View[]
  }

  export const buildView = (doc: Doc, cache: DocCache): View => {
    const categories = (doc.categories || [])
      .map(category => cache.categories.get(category)!)
      .filter(category => category !== undefined)
      .map(category => Category.buildView(category, cache))
    return ({
      doc,
      categories
    })
  }

  export const linkView = (view: View, views: DbView) => {
    view.categories.map(category => Category.linkView(category, views))
  }

  export namespace routes {
    export const all = 'budgets'
    export const view = 'budget/:budgetId'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
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

  export const maybeCreateCategory = (label: string, budgets: Budget.View[], lang: string, docs: AnyDocument[]): Category.DocId => {
    if (Category.isDocId(label)) {
      return label
    }

    const { budget, category: name } = validateNewCategory(budgets, label)
    if (!budget) {
      throw new Error('invalid category label: ' + label)
    }

    const newCategory = Category.doc(
      budget,
      {
        name,
        amount: 0
      },
      lang
    )
    docs.push(newCategory)

    const nextBudget: Budget.Doc = {
      ...budget,
      categories: [
        ...budget.categories,
        newCategory._id
      ]
    }
    docs.push(nextBudget)

    return newCategory._id
  }

  export interface CategoryInfo {
    budget?: Budget.Doc
    category: string
  }

  export const validateNewCategory = (budgets: Budget.View[], label?: string): CategoryInfo => {
    const [budgetName, category] = (label || '').split(':').map(x => x.trim())
    const idx = budgets.findIndex(b => b.doc.name.toLocaleLowerCase() === budgetName.toLocaleLowerCase())
    const budget = (idx === -1 ? undefined : budgets[idx].doc)
    return { budget, category }
  }
}
