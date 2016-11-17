import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { IntlProvider, addLocaleData } from 'react-intl'
import { AppState, AppDispatch, LoadAllDbs } from '../../modules'
import { LoginPage } from '../pages'
import * as en from 'react-intl/locale-data/en'

addLocaleData(en)

interface Props {
  all: string[]
  LoadAllDbs: () => any
}

export const AppComponent = (props: Props) => {
  return (
    <IntlProvider locale='en'>
      <LoginPage/>
    </IntlProvider>
  )
}

export const App = connect(
  (state: AppState) => ({}),
  (dispatch: AppDispatch) => bindActionCreators( { LoadAllDbs }, dispatch ),
)(AppComponent)
