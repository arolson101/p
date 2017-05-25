import * as React from 'react'
import { Route, Switch, Redirect, withRouter, HashRouter as Router } from 'react-router-dom'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { DbInfo, Bank, Account, Transaction, Bill, Budget, SyncConnection } from '../docs/index'
import { AppState } from '../state/index'
import * as Components from './components/index'

interface Props {
  store: Redux.Store<AppState>
}

interface ConnectedProps {
  locale: string
}

const requireAuth = (props: any) => {
  if (props.current) {
    return props.children
  } else {
    return <Redirect to='/'/>
  }
}

const AuthComponent = withRouter(connect(
  (state: AppState, props: any) => ({
    current: state.db.current,
  })
)(requireAuth))

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render () {
    const { store, locale } = this.props

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <Router>
            <Components.AppWindow>
              <Route exact path='/' component={Components.Login}/>
              <AuthComponent>
                <Components.AppContent>
                  <Switch>
                    <Route exact path={'/' + DbInfo.routes.home} component={Components.Home as any} />
                    <Route exact path={'/' + Bank.routes.all} component={Components.Accounts} />
                    <Route exact path={'/' + Bank.routes.view} component={Components.BankView}/>
                    <Route exact path={'/' + Bank.routes.del} component={Components.BankDelete}/>
                    <Route exact path={'/' + Account.routes.create} component={Components.AccountCreate}/>
                    <Route exact path={'/' + Account.routes.view} component={Components.AccountView}/>
                    <Route exact path={'/' + Account.routes.edit} component={Components.AccountEdit}/>
                    <Route exact path={'/' + Account.routes.del} component={Components.AccountDelete}/>
                    <Route exact path={'/' + Transaction.routes.edit} component={Components.TransactionEdit}/>
                    <Route exact path={'/' + Transaction.routes.view} component={Components.TransactionView}/>
                    <Route exact path={'/' + Bill.routes.all} component={Components.Bills}/>
                    <Route exact path={'/' + Bill.routes.create} component={Components.BillCreate}/>
                    <Route exact path={'/' + Bill.routes.edit} component={Components.BillEdit}/>
                    <Route exact path={'/' + Budget.routes.all} component={Components.Budgets as any}/>
                    <Route exact path={'/' + SyncConnection.routes.all} component={Components.Syncs as any}/>
                  </Switch>
                </Components.AppContent>
              </AuthComponent>
            </Components.AppWindow>
          </Router>
        </IntlProvider>
      </Provider>
    )
  }
}

export const App = connect(
  (state: AppState): ConnectedProps => ({ locale: state.i18n.locale })
)(AppComponent) as React.ComponentClass<Props>
