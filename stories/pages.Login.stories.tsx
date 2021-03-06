// tslint:disable:no-unused-expression
import * as React from 'react'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mountIntl, SelectedUI, expect, stub, action, storiesOfIntl, dummyDbInfo } from './storybook'

import { LoginComponent } from 'ui/pages/Login'
import { DbInfo } from 'core'

const stories = storiesOfIntl('Pages/Login', module)

const dummyProps = <T extends Function>(functor: (name: string) => T) => {
  return {
    showLoginDialog: functor('showLoginDialog') as any,
    showCreateDialog: functor('showCreateDialog') as any,
  }
}

stories.add('No files', () => {
  const files: DbInfo[] = []

  const story = (props: LoginComponent.DispatchProps) =>
  <LoginComponent
    files={files}
    UI={SelectedUI}
    {...props}
  />

  specs(() => describe('No files', () => {
    it('clicking new should open create dialog', () => {
      const props = dummyProps(stub)
      const output = mountIntl(story(props))
      const newdb = output.find('button#new')
      expect(newdb).to.exist
      newdb.simulate('click')
      expect(props.showCreateDialog.callCount).to.equal(1)
    })
  }))

  return story(dummyProps(action))
})

stories.add('One file', () => {
  const files = [dummyDbInfo('file 1')]

  const story = (props: LoginComponent.DispatchProps) =>
  <LoginComponent
    files={files}
    UI={SelectedUI}
    {...props}
  />

  specs(() => describe('One file', () => {
    it('clicking item should open login dialog', () => {
      const props = dummyProps(stub)
      const output = mountIntl(story(props))
      const open = output.find('button#open').first()
      expect(open).to.exist
      open.simulate('click')
      expect(props.showLoginDialog.callCount).to.equal(1)
      expect(props.showLoginDialog.lastCall.args[0]).to.have.property('info', files[0])
    })
  }))

  return story(dummyProps(action))
})

stories.add('Multiple files', () => {
  const files = [dummyDbInfo('file 1'), dummyDbInfo('file 2'), dummyDbInfo('file 3')]

  const story = (props: LoginComponent.DispatchProps) =>
  <LoginComponent
    files={files}
    UI={SelectedUI}
    {...props}
  />

  specs(() => describe('Multiple files', () => {
    it('clicking items should open correct login dialog', () => {
      const props = dummyProps(stub)
      const output = mountIntl(story(props))
      for (let i = 0; i < files.length; i++) {
        const open = output.find('button#open').at(i)
        expect(open).to.exist
        open.simulate('click')
        expect(props.showLoginDialog.callCount).to.equal(i + 1)
        expect(props.showLoginDialog.lastCall.args[0]).to.have.property('info', files[i])
      }
    })
  }))

  return story(dummyProps(action))
})
