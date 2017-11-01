// tslint:disable:no-unused-expression
import * as React from 'react'
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
import { specs, describe, it } from 'storybook-addon-specifications'
import { action, storiesOfIntl,
  dummyStore, dummyBankDocs, dummyBudgetDocs, Provider } from './storybook'

import { AppStore, selectBanks, selectBankAccounts } from 'core'
import { BankViewComponent } from 'ui/pages/BankView'

const stories = storiesOfIntl(`Pages/BankViewComponent`, module)

const story = <T extends Function>(store: AppStore, functor: (name: string) => T) => {
  const state = store.getState()
  const banks = selectBanks(state)!
  const bank = banks[0]
  const bankId = bank.doc._id
  const accounts = selectBankAccounts(state, bankId)
  const props = {
    bankId,
    bank,
    accounts,
    getAccounts: functor('getAccounts') as any,
    showAccountDialog: functor('showAccountDialog') as any,
    showBankDialog: functor('showBankDialog') as any,
    showBankDeleteDialog: functor('showBankDeleteDialog') as any,
  }
  return (
    <Provider store={store}>
      <Router history={createMemoryHistory()}>
        <BankViewComponent {...props} />
      </Router>
    </Provider>
  )
}

stories.add('empty', () => {
  const store = dummyStore(
    ...dummyBankDocs('bank 1', []),
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
    ...dummyBankDocs('bank 1', ['account 1', 'account 2', 'account 3']),
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
