import * as docURI from 'docuri'
import * as RRule from 'rrule-alt'
import { makeid } from 'util/index'
import { Account, Category } from './'

export interface Bill {
  name: string
  group: string
  web: string
  favicon?: string
  notes: string
  amount: number
  account?: Account.DocId
  category: Category.DocId
  rruleString: string
  showAdvanced?: boolean
}

export namespace Bill {
  export type Id = ':billId' | 'create' | makeid
  export type DocId = 'bill/:billId'
  export type Doc = TDocument<Bill, DocId>
  export interface Params { billId: Id }
  export const docId = docURI.route<Params, DocId>('bill/:billId')
  export const icon = 'fa fa-envelope'

  export interface View {
    doc: Doc
    rrule: RRule
  }

  export const buildView = (doc: Doc): View => ({
    doc,
    rrule: RRule.fromString(doc.rruleString)
  })

  export const allDocs = {
    startkey: 'bill/',
    endkey: 'bill/\uffff',
  }

  export namespace routes {
    export const all = 'bills'
    export const view = 'bill/:billId'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }

    export const view = (bill: Doc): string => {
      return '/' + bill._id
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (bank: Bill): Doc => {
    const _id = docId({ billId: makeid() })
    return { _id, ...bank }
  }

  export const getDate = (bill: View): Date => {
    if (!bill.rrule) {
      throw new Error(`bill doesn't have a rrule!`)
    }
    if (!bill.rrule.options.dtstart) {
      throw new Error(`bill doesn't have a start date!`)
    }
    const next = bill.rrule.after(new Date(), true)
    return next
  }
}
