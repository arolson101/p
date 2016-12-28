import * as History from 'history'
import * as React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { DbInfo, Bank, Account } from '../docs'
import { AppState, dbActions } from '../state'
import * as Components from './components'

interface Props {
  history: History.History
  store: Redux.Store<AppState>
}

interface ConnectedProps {
  locale: string
}

const NotFoundRoute = (props: Router.RouteComponentProps<any, any>) => (
  <div>not found: {props.location ? (props.location.query as any).pathname : '(no location)'}{props.children}</div>
)

const requireAuth = (store: Redux.Store<AppState>) =>
  (nextState: any, replace: any) => {
    if (!store.getState().db.current) {
      replace({
        pathname: '/'
      })
    }
  }

const logout = (store: Redux.Store<AppState>) =>
  (nextState: any, replace: any) => {
    if (store.getState().db.current) {
      store.dispatch(dbActions.unloadDb())
    }
    replace({
      pathname: '/'
    })
  }

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <Router history={history}>
            <Route path='/' component={Components.Root}>
              <IndexRoute component={Components.DbList}/>
              <Route path='logout' onEnter={logout(store)}/>
              <Route path={DbInfo.routes.create} component={Components.DbCreate}/>
              <Route path={DbInfo.routes.read} component={Components.DbRead}/>
              <Route onEnter={requireAuth(store)}>
                <Route path={Bank.routes.create} component={Components.BankCreate}/>
                <Route path={Bank.routes.read} component={Components.InRead}/>
                <Route path={Bank.routes.update} component={Components.BankUpdate}/>
                <Route path={Bank.routes.del} component={Components.BankDelete}/>
                <Route path={Account.routes.create} component={Components.AccountCreate}/>
                <Route path={Account.routes.read} component={Components.AccountRead}/>
                <Route path={Account.routes.update} component={Components.AccountUpdate}/>
                <Route path={Account.routes.del} component={Components.AccountDelete}/>
              </Route>
              <Route path='*' component={NotFoundRoute}/>
            </Route>
          </Router>
        </IntlProvider>
      </Provider>
    )
  }
}

export const App = connect(
  (state: AppState): ConnectedProps => ({ locale: state.i18n.locale })
)(AppComponent) as React.ComponentClass<Props>
