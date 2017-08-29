import * as expect from 'expect'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { action as addonAction } from '@storybook/addon-actions'
import { Story, storiesOf } from '@storybook/react'

import 'bootstrap/dist/css/bootstrap.css'

import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import createHistory from 'history/createHashHistory'
import { DbInfo, Account, Bank } from 'core'

export { specs, describe, it } from 'storybook-addon-specifications'
export { mount } from 'enzyme'
export { expect }

export const storiesOf2 = (name: string, module: NodeModule) => {
  return storiesOf(name, module)
}

export const action = addonAction as any

export const dummyDbInfo = (name: string): DbInfo => ({name, location: `location://${name}`})

const imports = { db: {} as any, online: {} }
const history = createHistory()
export const dummyAppStore = () => createAppStore(history, imports)

export const dummyAccountView = () => {
  const account: Account.View = {
    doc: {
      _id: 'account/asdf/asdf' as Account.DocId,
      name: 'account name',
      color: 'blue',
      type: Account.Type.CHECKING,
      number: 'account number',
      visible: true,
      bankid: 'bank id',
      key: 'account key',
    },
    transactionsRetrieved: false
  }

  const bank: Bank.View = {
    doc: {
      _id: 'bank/asdf' as Bank.DocId,
      name: 'asdf',
      accounts: [account.doc._id]
    }
  }

  return { account, bank }
}
