// tslint:disable:no-unused-expression
import * as React from 'react'
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
import { specs, describe, it } from 'storybook-addon-specifications'
import { action, storiesOfIntl,
  dummyStore, dummyBankWithTransactionsDocs, Provider } from './storybook'

import { AppStore, selectBanks, selectBankAccounts, selectTransactions } from 'core'
import { AccountViewComponent } from 'ui/pages/AccountView'

const stories = storiesOfIntl(`Pages/AccountViewComponent`, module)

const story = <T extends Function>(store: AppStore, functor: (name: string) => T) => {
  const state = store.getState()
  const banks = selectBanks(state)
  const bank = banks[0]
  const bankId = bank.doc._id
  const accounts = selectBankAccounts(state, bankId)
  const account = accounts[0]
  const accountId = account.doc._id
  const transactions = selectTransactions(state, accountId)
  const props = {
    accountId,
    bankId,
    bank,
    account,
    transactions,
    pushChanges: functor('pushChanges') as any,
    getTransactions: functor('getTransactions') as any,
    deleteAllTransactions: functor('deleteAllTransactions') as any,
    showAccountDialog: functor('showAccountDialog') as any,
    showAccountDeleteDialog: functor('showAccountDeleteDialog') as any,
  }
  return (
    <Provider store={store}>
      <Router history={createMemoryHistory()}>
        <AccountViewComponent {...props} />
      </Router>
    </Provider>
  )
}

stories.add('empty', () => {
  const store = dummyStore(
    ...dummyBankWithTransactionsDocs('bank 1', 'account 1', 0),
  )

  specs(() => describe('empty', () => {
    it('clicking cancel should hide dialog', () => {
      // const props = dummyProps(stub)
      // const output = mountIntl(story(props))
      // const cancel = output.find('.btn-default')
    })

    it('clicking submit should delete', () => {
      // const props = dummyProps(stub)
      // const output = mountIntl(story(props))
      // const del = output.find('.btn-danger')
      // expect(del).to.exist
      // del.simulate('click')
      // expect(props.deleteAccount.callCount).to.equal(1)
    })
  }))

  return story(store, action)
})

stories.add('normal', () => {
  const store = dummyStore(
    ...dummyBankWithTransactionsDocs('bank 1', 'account 1', 100),
  )

  specs(() => describe('normal', () => {
    it('clicking cancel should hide dialog', () => {
      // const props = dummyProps(stub)
      // const output = mountIntl(story(props))
      // const cancel = output.find('.btn-default')
    })

    it('clicking submit should delete', () => {
      // const props = dummyProps(stub)
      // const output = mountIntl(story(props))
      // const del = output.find('.btn-danger')
      // expect(del).to.exist
      // del.simulate('click')
      // expect(props.deleteAccount.callCount).to.equal(1)
    })
  }))

  return story(store, action)
})

stories.add('lots of transactions', () => {
  const store = dummyStore(
    ...dummyBankWithTransactionsDocs('bank 1', 'account 1', 1000),
  )

  specs(() => describe('lots of transactions', () => {
    it('clicking cancel should hide dialog', () => {
      // const props = dummyProps(stub)
      // const output = mountIntl(story(props))
      // const cancel = output.find('.btn-default')
    })

    it('clicking submit should delete', () => {
      // const props = dummyProps(stub)
      // const output = mountIntl(story(props))
      // const del = output.find('.btn-danger')
      // expect(del).to.exist
      // del.simulate('click')
      // expect(props.deleteAccount.callCount).to.equal(1)
    })
  }))

  return story(store, action)
})
