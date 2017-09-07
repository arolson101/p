import * as Enzyme from 'enzyme'
import * as React from 'react'
import { IntlProvider, intlShape } from 'react-intl'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import * as Sinon from 'sinon'
import { action } from '@storybook/addon-actions'
import { Story, storiesOf } from '@storybook/react'

import 'bootstrap/dist/css/bootstrap.css'

import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import createHistory from 'history/createHashHistory'
import { DbInfo, Account, Bank } from 'core'

export { action }
export { expect } from 'chai'
export { specs, describe, it } from 'storybook-addon-specifications'
export { storiesOf }

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
