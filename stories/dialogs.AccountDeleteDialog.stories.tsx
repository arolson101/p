import { mount } from 'enzyme'
import * as expect from 'expect'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { withKnobs, select } from '@storybook/addon-knobs'

import { DbInfo, Account, Bank } from 'core'
import { AccountDeleteDialogComponent } from 'ui/dialogs/AccountDeleteDialog'

import { action, storiesOf2, dummyAppStore, dummyDbInfo, dummyAccountView } from './storybook'
import { specs, describe, it } from 'storybook-addon-specifications'
import * as Sinon from 'sinon'

const store = dummyAppStore()

const stories = storiesOf2(`Dialogs`, module)
stories.addDecorator(withKnobs)

// stories.addDecorator(getStory => (
//   <Provider store={store}>
//     <IntlProvider locale={'en'}>
//       {getStory()}
//     </IntlProvider>
//   </Provider>
// ))
stories.addDecorator(getStory => (
  <IntlProvider locale={'en'}>
    {getStory()}
  </IntlProvider>
))

stories.add('AccountDeleteDialog', () => {
  // const dispatch = Sinon.stub(store, 'dispatch')
  // dispatch.callsFake(action('dispatch'))

  const { account, bank } = dummyAccountView()
  const story = (
    <AccountDeleteDialogComponent
      show
      deleting
      error={new Error('error message')}
      onHide={action('onHide')}
      confirmDelete={action('confirmDelete')}
      deleteAccount={action('deleteAccount')}
      replace={action('replace')}
      bank={bank}
      account={account}
      {...{store}}
    />
  )

  specs(() => describe('No dbs', () => {
    it('should do something', () => {
      // let output = mount(story)
      // console.log(output)
      // expect(output.text()).toContain('foo')
    })
  }))

  return story
})
