import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { WithNotes } from '@storybook/addon-notes'
import { DatePicker } from '../src/ui/components/DatePicker'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import createHistory from 'history/createHashHistory'
import * as moment from 'moment'
import { withKnobs, select } from '@storybook/addon-knobs'
import { LoginComponent } from 'ui/pages/Login'
import { DbInfo } from 'core'
import 'bootstrap/dist/css/bootstrap.css'

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
    <WithNotes notes='this is a datepicker'>
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
    </WithNotes>
  )
})
