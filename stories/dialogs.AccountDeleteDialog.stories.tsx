import { mount } from 'enzyme'
import * as expect from 'expect'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { withKnobs, boolean } from '@storybook/addon-knobs'

import { DbInfo, Account, Bank } from 'core'
import { AccountDeleteDialogComponent } from 'ui/dialogs/AccountDeleteDialog'

import { action, storiesOf2, dummyAppStore, dummyDbInfo, dummyAccountView } from './storybook'
import { specs, describe, it } from 'storybook-addon-specifications'

const store = dummyAppStore()

const stories = storiesOf2(`Dialogs/AccountDeleteDialog`, module)
stories.addDecorator(withKnobs)

stories.addDecorator(getStory => (
  <IntlProvider locale={'en'}>
    {getStory()}
  </IntlProvider>
))

stories.add('normal', () => {
  const { account, bank } = dummyAccountView()
  const story = (
    <AccountDeleteDialogComponent
      onHide={action('onHide')}
      deleteAccount={action('deleteAccount')}
      replace={action('replace')}
      bank={bank}
      account={account}
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

stories.add('deleting', () => {
  const { account, bank } = dummyAccountView()
  const story = (
    <AccountDeleteDialogComponent
      deleting
      onHide={action('onHide')}
      deleteAccount={action('deleteAccount')}
      replace={action('replace')}
      bank={bank}
      account={account}
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

stories.add('with error', () => {
  const { account, bank } = dummyAccountView()
  const story = (
    <AccountDeleteDialogComponent
      error={new Error('error message')}
      onHide={action('onHide')}
      deleteAccount={action('deleteAccount')}
      replace={action('replace')}
      bank={bank}
      account={account}
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
