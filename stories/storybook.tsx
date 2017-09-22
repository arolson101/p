import { expect } from 'chai'
import * as Enzyme from 'enzyme'
import * as React from 'react'
import { IntlProvider, intlShape } from 'react-intl'
import { Provider } from 'react-redux'
import * as Sinon from 'sinon'
import { action } from '@storybook/addon-actions'
import { Story, storiesOf } from '@storybook/react'
import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css'

import { createAppStore, AppInit, ImportsState, syncProviders, setDocs } from 'core'
import createHistory from 'history/createHashHistory'
import { DbInfo, Account, Bank, Budget, Category } from 'core'
export { action }
export { expect }
export { specs, describe, it } from 'storybook-addon-specifications'
export { storiesOf }
export { Provider }

import { setObservableConfig } from 'recompose'
import rxjsconfig from 'recompose/rxjsObservableConfig'

setObservableConfig(rxjsconfig)

export const stub = () => Sinon.stub()

const messages = new Proxy({}, {
  get: function getter (target, key) {
    if (key === '__esModule') {
      return false
    }
    return key
  }
})

export const storiesOfIntl = (name: string, mod: NodeModule): Story => {
  const stories = storiesOf(name, mod)

  stories.addDecorator(getStory => (
    <IntlProvider locale={'en'}>
      {getStory()}
    </IntlProvider>
  ))

  return stories
}

const intlProvider = new IntlProvider({ locale: 'en-US', messages }, {})
const { intl } = intlProvider.getChildContext()

const mountIntlProps = { context: { intl }, childContextTypes: { intl: intlShape }}

export const mountIntl: typeof Enzyme.mount = (node: any, options: any) => Enzyme.mount(node, mountIntlProps)

export const dummyDbInfo = (name: string): DbInfo => ({name, location: `location://${name}`})

const imports = { db: {} as any, online: {} }
const history = createHistory()
export const dummyStore = (...docs: AnyDocument[]) => {
  const store = createAppStore(history, imports)
  store.dispatch(setDocs(docs))
  return store
}

const dummyAccount = (bank: string, account: string): Account.Doc => {
  return {
    _id: `account/${bank}/${account}` as Account.DocId,
    name: account,
    color: 'blue',
    type: Account.Type.CHECKING,
    number: 'account number',
    visible: true,
    bankid: `bank/${bank}`,
    key: 'account key',
  }
}

export const dummyBank = (bankName: string, accountNames: string[]) => {
  const accounts = accountNames.map(acct => dummyAccount(bankName, acct))
  const bank: Bank.Doc = {
    _id: `bank/${bankName}` as Bank.DocId,
    name: bankName,
    accounts: accounts.map(acct => acct._id)
  }

  return { bank, accounts }
}

export const dummyBankDocs = (bankName: string, accountNames: string[]) => {
  const { bank, accounts } = dummyBank(bankName, accountNames)
  return [bank, ...accounts]
}

export const dummyAccountView = () => {
  const { bank: bankDoc, accounts: accountDocs } = dummyBank('asdf', ['asdf'])
  const account: Account.View = {
    doc: accountDocs[0],
    transactionsRetrieved: false
  }

  const bank: Bank.View = {
    doc: bankDoc
  }

  return { account, bank }
}

export const dummyBudget = (budgetName: string) => {
  const budgetId = `budget/${budgetName}`
  const categories: Category.Doc[] = [
    {_id: `category/${budgetName}/cat1` as Category.DocId, name: 'category 1', amount: 101},
    {_id: `category/${budgetName}/cat2` as Category.DocId, name: 'category 2', amount: 102},
    {_id: `category/${budgetName}/cat3` as Category.DocId, name: 'category 3', amount: 103}
  ]
  const budget: Budget.Doc = {
    _id: budgetId as Budget.DocId,
    name: budgetName,
    categories: categories.map(cat => cat._id),
    sortOrder: 1
  }
  return { budget, categories }
}

export const dummyBudgetDocs = (budgetName: string) => {
  const { budget, categories } = dummyBudget(budgetName)
  return [budget, ...categories]
}
