// tslint:disable:no-unused-expression
import * as React from 'react'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mountIntl, expect, stub, action, storiesOfIntl, dummyAccountView } from './storybook'

import { AccountDialogComponent } from 'ui/dialogs/AccountDialog'

const stories = storiesOfIntl(`Dialogs/AccountDialog`, module)

const dummyProps = <T extends Function>(functor: (name: string) => T) => {
  const { bank } = dummyAccountView()

  return {
    onHide: functor('onHide'),
    saveAccount: functor('saveAccount') as any,
    push: functor('push'),
    bank: bank,
    accounts: []
  }
}

stories.add('normal', () => {
  const story = (props: AccountDialogComponent.Props) =>
    <AccountDialogComponent
      {...props}
    />

  specs(() => describe('normal', () => {
    it('clicking cancel should hide dialog', () => {
      const props = dummyProps(stub)
      const output = mountIntl(story(props))
      const cancel = output.find('.btn-default')
      expect(cancel).to.exist
      cancel.simulate('click')
      expect(props.onHide.callCount).to.equal(1)
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

  return story(dummyProps(action))
})
