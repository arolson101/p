// tslint:disable:no-unused-expression
import * as React from 'react'
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
import { specs, describe, it } from 'storybook-addon-specifications'
import { action, storiesOfIntl,
  dummyStore, dummyBankDocs, Provider } from './storybook'

import { AppStore, selectBanks } from 'core'
import { AccountsComponent } from 'ui/pages/Accounts'

const stories = storiesOfIntl(`Pages/Accounts`, module)

const story = <T extends Function>(store: AppStore, functor: (name: string) => T) => {
  const state = store.getState()
  const props = {
    banks: selectBanks(state),
    showBankDialog: functor('showBankDialog') as any,
  }
  return (
    <Provider store={store}>
      <Router history={createMemoryHistory()}>
        <AccountsComponent {...props} />
      </Router>
    </Provider>
  )
}

stories.add('empty', () => {
  const store = dummyStore()

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
    ...dummyBankDocs('bank 1', ['account 1a', 'account 1b']),
    ...dummyBankDocs('bank 2', ['account 2a']),
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
