import { mount } from 'enzyme'
import * as expect from 'expect'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { action } from '@storybook/addon-actions'
import { withKnobs, select } from '@storybook/addon-knobs'

import { DbInfo, Account, Bank } from 'core'
import { AccountDeleteDialog } from 'ui/dialogs/AccountDeleteDialog'

import { storiesOf2, dummyAppStore, dummyDbInfo } from './storybook'
import { specs, describe, it } from 'storybook-addon-specifications'

const store = dummyAppStore()

const stories = storiesOf2(`Dialogs`, module)
stories.addDecorator(withKnobs)

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

stories.addDecorator(getStory => (
  <Provider store={store}>
    <IntlProvider locale={'en'}>
      {getStory()}
    </IntlProvider>
  </Provider>
))

stories.add('AccountDeleteDialog', () => {
  const story = (
    <AccountDeleteDialog
      show
      onHide={action('onHide')}
      bank={bank}
      account={account}
      {...{store}}
    />
  )

  specs(() => describe('No dbs', () => {
    it('should do something', () => {
      let output = mount(story)
      console.log(output)
      expect(output.text()).toContain('foo')
    })
  }))

  return story
})
