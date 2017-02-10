import * as docURI from 'docuri'
import { makeid, Lookup } from '../util'
import * as RRule from 'rrule-alt'

export interface Bill {
  name: string
  group: string
  web: string
  favicon?: string
  notes: string
  amount: number
  rruleString: string
}

export namespace Bill {
  export type Id = ':billId' | 'create' | makeid
  export type DocId = 'bill/:billId'
  export type Doc = PouchDB.Core.Document<Bill> & { _id: DocId; _rev?: string }
  export interface Params { billId: Id }
  export const docId = docURI.route<Params, DocId>('bill/:billId')
  export type Cache = Lookup<DocId, Doc>
  export const createCache = Lookup.create as (docs?: Doc[]) => Lookup<DocId, Doc>
  export const icon = 'fa fa-envelope'

  export type View = {
    doc: Doc
    rrule: RRule
  }

  export const buildView = (doc: Doc): View => {
    return ({
      doc,
      rrule: RRule.fromString(doc.rruleString)
    })
  }

  export namespace routes {
    export const all = 'bills'
    export const create = 'bill/create'
    export const view = 'bill/:billId'
    export const edit = 'bill/:billId/edit'
    export const del = 'bill/:billId/delete'
  }

  export namespace to {
    export const all = () => {
      return '/' + routes.all
    }

    export const create = () => {
      return '/' + routes.create
    }

    export const view = (bill: Doc): string => {
      return '/' + bill._id
    }

    export const edit = (bill: Doc): string => {
      return '/' + bill._id + '/edit'
    }

    export const del = (bill: Doc): string => {
      return '/' + bill._id + '/delete'
    }
  }

  export const isDocId = (id: string): boolean => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const doc = (bank: Bill, lang: string): Doc => {
    const _id = docId({ billId: makeid(bank.name, lang) })
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
