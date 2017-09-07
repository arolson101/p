import { mount } from 'enzyme'
import * as expect from 'expect'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { specs, describe, it } from 'storybook-addon-specifications'

import { DbInfo, Account, Bank } from 'core'
import { AccountDeleteDialogComponent } from 'ui/dialogs/AccountDeleteDialog'

import { stub, action, storiesOf, dummyAppStore, dummyDbInfo, dummyAccountView, mountIntl } from './storybook'

const store = dummyAppStore()

const stories = storiesOf(`Dialogs/AccountDeleteDialog`, module)

stories.addDecorator(getStory => (
  <IntlProvider locale={'en'}>
    {getStory()}
  </IntlProvider>
))

const dummyProps = <T extends Function>(action: (name: string) => T) => {
  const { account, bank } = dummyAccountView()

  return {
    onHide: action('onHide'),
    deleteAccount: action('deleteAccount'),
    replace: action('replace'),
    bank: bank,
    account: account,
  }
}

stories.add('normal', () => {
  const story = (props: any) =>
    <AccountDeleteDialogComponent
      {...props}
    />

  specs(() => describe('normal', () => {
    it('clicking cancel should hide dialog', () => {
      const props = dummyProps(stub)
      const output = mount(story(props), mountIntl)
      const cancel = output.find('.btn-default')
      expect(cancel).toExist()
      cancel.simulate('click')
      expect(props.onHide.calledOnce).toBeTruthy()
    })

    it('clicking submit should delete', () => {
      const props = dummyProps(stub)
      const output = mount(story(props), mountIntl)
      const del = output.find('.btn-danger')
      expect(del).toExist()
      del.simulate('click')
      expect(props.deleteAccount.calledOnce).toBeTruthy()
    })
  }))

  return story(dummyProps(action))
})

stories.add('deleting', () => {
  const story = (props: any) =>
  <AccountDeleteDialogComponent
    deleting
    {...props}
  />

  specs(() => describe('deleting', () => {
    it('buttons are disabled while deleting', () => {
      const props = dummyProps(stub)
      const output = mount(story(props), mountIntl)
      const del = output.find('.btn-danger')
      const cancel = output.find('.btn-default')
      expect(cancel).toExist()
      cancel.simulate('click')
      expect(del).toExist()
      del.simulate('click')
      expect(props.onHide.notCalled).toBeTruthy()
      expect(props.deleteAccount.notCalled).toBeTruthy()
    })
  }))

  return story(dummyProps(action))
})

stories.add('with error', () => {
  const error = new Error('error message')
  const story = <T extends {}>(props: any) =>
    <AccountDeleteDialogComponent
      error={error}
      {...props}
    />

  specs(() => describe('with error', () => {
    it('should contain error text', () => {
      const props = dummyProps(stub)
      const output = mount(story(props), mountIntl)
      expect(output.text()).toContain(error.message)
    })
  }))

  return story(dummyProps(action))
})
