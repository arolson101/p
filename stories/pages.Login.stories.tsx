import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { withKnobs, select } from '@storybook/addon-knobs'
import { LoginComponent } from 'ui/pages/Login'
import { AccountDeleteDialog } from 'ui/dialogs/AccountDeleteDialog'
import { DbInfo, Account, Bank } from 'core'

import { storiesOf, action, dummyDbInfo, dummyAppStore } from './storybook'

const stories = storiesOf('Pages/Login', module)

stories.add('One file', () => {
  const files = [dummyDbInfo('file 1')]
  const store = dummyAppStore()

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

stories.add('No files', () => {
  const files: DbInfo[] = []
  const store = dummyAppStore()

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

stories.add('Multiple files', () => {
  const files = [dummyDbInfo('file 1'), dummyDbInfo('file 2'), dummyDbInfo('file 3')]
  const store = dummyAppStore()

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
