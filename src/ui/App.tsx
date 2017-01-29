import * as History from 'history'
import * as React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { DbInfo, Bank, Account, Transaction, Bill } from '../docs'
import { AppState } from '../state'
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
        pathname: '/',
        state: { nextPathname: nextState.location.pathname }
      })
    }
  }

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <Router history={history}>
            <Route path='/' component={Components.Root}>
              <IndexRoute component={Components.Login}/>
              <Route onEnter={requireAuth(store)}>
                <Route path={DbInfo.routes.home} component={Components.Home} />
                <Route path={Bank.routes.all} component={Components.Accounts} />
                <Route path={Bank.routes.create} component={Components.BankCreate}/>
                <Route path={Bank.routes.view} component={Components.BankView}/>
                <Route path={Bank.routes.edit} component={Components.BankEdit}/>
                <Route path={Bank.routes.del} component={Components.BankDelete}/>
                <Route path={Account.routes.create} component={Components.AccountCreate}/>
                <Route path={Account.routes.view} component={Components.AccountView}/>
                <Route path={Account.routes.edit} component={Components.AccountEdit}/>
                <Route path={Account.routes.del} component={Components.AccountDelete}/>
                <Route path={Transaction.routes.view} component={Components.TransactionView}/>
                <Route path={Bill.routes.all} component={Components.Bills}/>
                <Route path={Bill.routes.create} component={Components.BillCreate}/>
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