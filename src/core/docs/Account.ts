const randomColor = require<(options?: RandomColorOptions) => string>('randomcolor')
import * as docURI from 'docuri'
import { defineMessages } from 'react-intl'
import { makeid } from 'util/index'
import { Bank } from './Bank'

export interface Account {
  name: string
  color: string
  type: Account.Type
  number: string
  visible: boolean
  bankid: string
  key: string
}

export namespace Account {
  // see ofx4js.domain.data.banking.AccountType
  export type Type = 'CHECKING' | 'SAVINGS' | 'MONEYMRKT' | 'CREDITLINE' | 'CREDITCARD'
  export const Type = {
    CHECKING: 'CHECKING' as Type,
    SAVINGS: 'SAVINGS' as Type,
    MONEYMRKT: 'MONEYMRKT' as Type,
    CREDITLINE: 'CREDITLINE' as Type,
    CREDITCARD: 'CREDITCARD' as Type
  }

  export const messages = defineMessages({
    CHECKING: {
      id: 'Account.Type.CHECKING',
      defaultMessage: 'Checking'
    },
    SAVINGS: {
      id: 'Account.Type.SAVINGS',
      defaultMessage: 'Savings'
    },
    MONEYMRKT: {
      id: 'Account.Type.MONEYMRKT',
      defaultMessage: 'Money Market'
    },
    CREDITLINE: {
      id: 'Account.Type.CREDITLINE',
      defaultMessage: 'Credit Line'
    },
    CREDITCARD: {
      id: 'Account.Type.CREDITCARD',
      defaultMessage: 'Credit Card'
    }
  })

  export const icons = {
    [Type.CHECKING]: 'fa fa-list-alt',
    [Type.SAVINGS]: 'fa fa-money',
    [Type.MONEYMRKT]: 'fa fa-money',
    [Type.CREDITLINE]: 'fa fa-credit-card-alt',
    [Type.CREDITCARD]: 'fa fa-credit-card'
  }

  export const generateColor = (type?: Type): string => {
    switch (type) {
      case Type.CHECKING:
        return randomColor({ hue: 'red', luminosity: 'bright' })
      case Type.SAVINGS:
        return randomColor({ hue: 'green', luminosity: 'bright' })
      case Type.MONEYMRKT:
        return randomColor({ hue: 'purple', luminosity: 'bright' })
      case Type.CREDITLINE:
        return randomColor({ hue: 'blue', luminosity: 'bright' })
      case Type.CREDITCARD:
        return randomColor({ hue: 'orange', luminosity: 'bright' })

      default:
        return randomColor({ luminosity: 'bright' })
    }
  }

  export type Id = ':accountId' | 'create' | makeid
  export type DocId = 'account/:bankId/:accountId'
  export type Doc = TDocument<Account, DocId>
  export interface Params { bankId: Bank.Id, accountId: Id }
  export const docId = docURI.route<Params, DocId>('account/:bankId/:accountId')
  export const icon = 'fa fa-university'

  export const allDocs = {
    startkey: 'account/',
    endkey: 'account/\uffff',
  }

  export interface View {
    doc: Doc
    transactionsRetrieved: boolean
  }

  export const buildView = (doc: Doc): View => ({
    doc,
    transactionsRetrieved: false
  })

  export namespace routes {
    export const view = 'account/:bankId/:accountId'
  }

  export namespace to {
    export const view = (account: Doc): string => {
      return '/' + account._id
    }
  }

  export const isDocId = (id: string): id is DocId => {
    return !!docId(id as DocId)
  }

  export const isDoc = (doc: AnyDocument): doc is Doc => {
    return !!docId(doc._id as DocId)
  }

  export const idFromDocId = (account: DocId): Id => {
    const aparts = docId(account)
    if (!aparts) {
      throw new Error('not an account id: ' + account)
    }
    return aparts.accountId
  }

  export const doc = (bank: Bank.Doc, account: Account | Doc): Doc => {
    const iparams = Bank.docId(bank._id)
    if (!iparams) {
      throw new Error('invalid bankId: ' + bank._id)
    }
    const _id = docId({
      bankId: iparams.bankId,
      accountId: makeid()
    })
    return { _id, ...account }
  }

  export const getBank = (account: Doc): Bank.DocId => {
    const aparams = docId(account._id)
    if (!aparams) {
      throw new Error('invalid accountId: ' + account._id)
    }
    return Bank.docId(aparams)
  }
}
