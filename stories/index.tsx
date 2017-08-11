import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { DatePicker } from '../src/ui/components/DatePicker'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import createHistory from 'history/createHashHistory'
import * as moment from 'moment'

const action = (str: string) => () => console.log(str)

const history = createHistory()
const store = createAppStore(history)
let value = moment().format('L')

storiesOf('Button', module)
  .add('AccountDialog', () => (
    <Provider store={store}>
      <IntlProvider locale={'en'}>
        <DatePicker value={value} onChange={(x) => value = x} />
      </IntlProvider>
    </Provider>
  ))
  .add('with some emoji', () => (
    <button onClick={action('clicked')}>😀 😎 👍 💯</button>
  ))
