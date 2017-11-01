import { History } from 'history'
import * as React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { compose } from 'recompose'
import * as Redux from 'redux'
import { Bank, Account, Transaction, Bill, Budget, SyncConnection } from 'core/docs'
import { AppState, CurrentDb } from 'core/state'
import * as Components from './components'
import * as Pages from './pages'

interface Props {
  store: Redux.Store<AppState>
  history: History
}

interface ConnectedProps {
  locale: string
  current?: CurrentDb
}

type EnhancedProps = Props & ConnectedProps

const enhance = compose<EnhancedProps, Props>(
  connect<ConnectedProps, {}, Props>(
    (state: AppState): ConnectedProps => ({
      locale: state.i18n.locale,
      current: state.db.current,
    })
  )
)

export const App = enhance(props => {
  const { store, history, locale, current } = props

  return (
    <Provider store={store}>
      <IntlProvider locale={locale}>
        <ConnectedRouter history={history}>
          <Components.AppWindow>
            <Route exact path='/' component={Pages.LoginRoute}/>
            {current ? (
              <Components.AppContent>
                <Switch>
                  <Route exact path={'/home'} component={Pages.Home as any} />
                  <Route exact path={'/' + Bank.routes.all} component={Pages.Accounts as any} />
                  <Route exact path={'/' + Bank.routes.view} component={Pages.BankViewRoute}/>
                  <Route exact path={'/' + Account.routes.view} component={Pages.AccountViewRoute}/>
                  <Route exact path={'/' + Transaction.routes.edit} component={Pages.TransactionEditRoute}/>
                  <Route exact path={'/' + Transaction.routes.view} component={Pages.TransactionViewRoute}/>
                  <Route exact path={'/' + Bill.routes.all} component={Pages.Bills as any}/>
                  <Route exact path={'/' + Budget.routes.all} component={Pages.Budgets as any}/>
                  <Route exact path={'/' + SyncConnection.routes.all} component={Pages.Syncs as any}/>
                </Switch>
              </Components.AppContent>
            ) : (
              <Redirect to='/'/>
            )}
          </Components.AppWindow>
        </ConnectedRouter>
      </IntlProvider>
    </Provider>
  )
})
