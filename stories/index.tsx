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

const imports = { db: {} as any, online: {} }
const history = createHistory()
const store = createAppStore(history, imports)
let value = moment().format('L')

const stories = storiesOf('Knobs', module)
stories.addDecorator(withKnobs)

stories.add('AccountDialog', () => {
  const locale = select('locale', ['en', 'fr'], 'en')
  return (
    <WithNotes notes='this is a datepicker'>
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <div>
            <div>{locale}</div>
            <DatePicker value={value} onChange={(x) => value = x} />
          </div>
        </IntlProvider>
      </Provider>
    </WithNotes>
  )
})

stories.add('with some emoji', () => (
  <button onClick={action('clicked')}>😀 😎 👍 💯</button>
))
