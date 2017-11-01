// tslint:disable:no-unused-expression
import * as React from 'react'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mountIntl, expect, stub, action, storiesOfIntl, dummyFiList } from './storybook'

import { BankDialogComponent } from 'ui/dialogs/BankDialog'

const stories = storiesOfIntl(`Dialogs/BankDialog`, module)

const dummyProps = <T extends Function>(functor: (name: string) => T) => {
  return {
    onHide: functor('onHide'),
    filist: dummyFiList(),
    saveBank: functor('saveBank'),
    push: functor('push')
  }
}

stories.add('normal', () => {
  const story = (props: BankDialogComponent.Props) =>
    <BankDialogComponent
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
  }))

  return story(dummyProps(action) as any)
})
