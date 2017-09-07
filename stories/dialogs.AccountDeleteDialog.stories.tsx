/* tslint:disable:no-unused-expression */
import * as React from 'react'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mountIntl, expect, stub, action, storiesOfIntl, dummyAccountView } from './storybook'

import { DbInfo, Account, Bank } from 'core'
import { AccountDeleteDialogComponent } from 'ui/dialogs/AccountDeleteDialog'

const stories = storiesOfIntl(`Dialogs/AccountDeleteDialog`, module)

const dummyProps = <T extends Function>(functor: (name: string) => T) => {
  const { account, bank } = dummyAccountView()

  return {
    onHide: functor('onHide'),
    deleteAccount: functor('deleteAccount'),
    replace: functor('replace'),
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
      const output = mountIntl(story(props))
      const cancel = output.find('.btn-default')
      expect(cancel).to.exist
      cancel.simulate('click')
      expect(props.onHide.calledOnce).to.be.true
    })

    it('clicking submit should delete', () => {
      const props = dummyProps(stub)
      const output = mountIntl(story(props))
      const del = output.find('.btn-danger')
      expect(del).to.exist
      del.simulate('click')
      expect(props.deleteAccount.calledOnce).to.be.true
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
      const output = mountIntl(story(props))
      const del = output.find('.btn-danger')
      const cancel = output.find('.btn-default')
      expect(cancel).to.exist
      cancel.simulate('click')
      expect(del).to.exist
      del.simulate('click')
      expect(props.onHide.notCalled).to.be.true
      expect(props.deleteAccount.notCalled).to.be.true
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
      const output = mountIntl(story(props))
      expect(output.text()).to.contain(error.message)
    })
  }))

  return story(dummyProps(action))
})
