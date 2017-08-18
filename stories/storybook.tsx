import * as expect from 'expect'
import * as React from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { Story, storiesOf } from '@storybook/react'

import 'bootstrap/dist/css/bootstrap.css'

import { createAppStore, AppInit, ImportsState, syncProviders } from 'core'
import createHistory from 'history/createHashHistory'
import { DbInfo, Account, Bank } from 'core'

export { action } from '@storybook/addon-actions'
export { specs, describe, it } from 'storybook-addon-specifications'
export { mount } from 'enzyme'
export { expect }

export const storiesOf2 = (name: string, module: NodeModule) => {
  return storiesOf(name, module)
}

export const dummyDbInfo = (name: string): DbInfo => ({name, location: `location://${name}`})

const imports = { db: {} as any, online: {} }
const history = createHistory()
export const dummyAppStore = () => createAppStore(history, imports)
