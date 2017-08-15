import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { DatePicker } from '../src/ui/components/DatePicker'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import createHistory from 'history/createHashHistory'
import * as moment from 'moment'
import { withKnobs, select } from '@storybook/addon-knobs'
import { LoginComponent } from 'ui/pages/Login'
import { AccountDeleteDialog } from 'ui/dialogs/AccountDeleteDialog'
import { DbInfo, Account, Bank } from 'core'
import 'bootstrap/dist/css/bootstrap.css'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mount } from 'enzyme'
import * as expect from 'expect'

const imports = { db: {} as any, online: {} }
const history = createHistory()
const store = createAppStore(history, imports)
let value = moment().format('L')

const stories = storiesOf('Pages', module)
stories.addDecorator(withKnobs)

const dummyDbInfo = (name: string): DbInfo => ({name, location: `location://${name}`})

stories.add('Login', () => {
  const filesOptions: { [key: string]: DbInfo[] } = {
    emptyFiles: [],
    oneFile: [dummyDbInfo('one file')],
    multipleFiles: [dummyDbInfo('file 1'), dummyDbInfo('file 2'), dummyDbInfo('file 3')],
  }
  const filesKeys = Object.keys(filesOptions)
  const filesKey = select('files', filesKeys, filesKeys[Object.values(filesOptions).indexOf(filesOptions.oneFile)])
  const files = filesOptions[filesKey]

  return (
    <Provider store={store}>
      <IntlProvider locale={'en'}>
        <div>
          <LoginComponent
            files={files}
            showLoginDialog={action('showLoginDialog') as any}
            showCreateDialog={action('showCreateDialog') as any}
          />
        </div>
      </IntlProvider>
    </Provider>
  )
})

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

const storyName = 'AccountDeleteDialog'

stories.addDecorator(getStory => (
  <Provider store={store}>
    <IntlProvider locale={'en'}>
      {getStory()}
    </IntlProvider>
  </Provider>
))

stories.add(storyName, () => {
  const filesOptions: { [key: string]: DbInfo[] } = {
    emptyFiles: [],
    oneFile: [dummyDbInfo('one file')],
    multipleFiles: [dummyDbInfo('file 1'), dummyDbInfo('file 2'), dummyDbInfo('file 3')],
  }
  const filesKeys = Object.keys(filesOptions)
  const filesKey = select('files', filesKeys, filesKeys[Object.values(filesOptions).indexOf(filesOptions.oneFile)])
  const files = filesOptions[filesKey]

  const story = (
    <AccountDeleteDialog
      show
      onHide={action('onHide')}
      bank={bank}
      account={account}
      {...{store}}
    />
  )

  specs(() => describe(storyName, () => {
    it('should do something', () => {
      let output = mount(story)
      console.log(output)
      expect(output.text()).toContain('foo')
    })
  }))

  return story
})
