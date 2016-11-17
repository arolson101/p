import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { AppState, AppDispatch } from '../../modules'
import { LoginPage } from '../pages'

interface Props {
  locale: string
}

export const AppComponent = (props: Props) => {
  return (
    <IntlProvider locale={props.locale}>
      <LoginPage/>
    </IntlProvider>
  )
}

export const App = connect(
  (state: AppState) => ({ locale: state.i18n.locale }),
  (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
)(AppComponent)
