import * as docURI from 'docuri'
import { makeid, Lookup } from 'util/index'
import { DocCache, Category } from './'

export interface Budget {
  name: string
  categories: Category.DocId[]
  sortOrder: number
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
  export const compare = (a: View, b: View) => (a.doc.sortOrder - b.doc.sortOrder)

  export interface View {
    doc: Doc
  }

  export const buildView = (doc: Doc): View => ({
    doc,
  })

  export const allDocs = {
    startkey: 'budget/',
    endkey: 'budget/\uffff',
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

  export const doc = (budget: Budget): Doc => {
    const _id = docId({
      budgetId: makeid()
    })
    return { _id, ...budget }
  }

  export const maybeCreateCategory = (label: string, budgets: Budget.View[], docs: AnyDocument[]): Category.DocId => {
    if (Category.isDocId(label)) {
      return label
    }

    const { budget, category: name } = validateNewCategory(budgets, label)
    if (!budget) {
      throw new Error('invalid category label: ' + label)
    }

    const newCategory = Category.doc(
      budget.doc,
      {
        name,
        amount: 0
      }
    )
    docs.push(newCategory)

    const nextBudget: Budget.Doc = {
      ...budget.doc,
      categories: [
        ...budget.doc.categories,
        newCategory._id
      ]
    }
    docs.push(nextBudget)

    return newCategory._id
  }

  export interface CategoryInfo {
    budget?: Budget.View
    category: string
  }

  export const validateNewCategory = (budgets: Budget.View[], label?: string): CategoryInfo => {
    const [budgetName, category] = (label || '').split(':').map(x => x.trim())
    const idx = budgets.findIndex(b => b.doc.name.toLocaleLowerCase() === budgetName.toLocaleLowerCase())
    const budget = (idx === -1 ? undefined : budgets[idx])
    return { budget, category }
  }
}
