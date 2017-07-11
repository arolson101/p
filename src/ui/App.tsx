import { History } from 'history'
import * as React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { compose } from 'recompose'
import * as Redux from 'redux'
import { DbInfo, Bank, Account, Transaction, Bill, Budget, SyncConnection } from '../docs/index'
import { AppState, CurrentDb } from '../state/index'
import * as Components from './components/index'
import * as Pages from './pages/index'

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
            <Route exact path='/' component={Pages.Login}/>
            {current ? (
              <Components.AppContent>
                <Switch>
                  <Route exact path={'/' + DbInfo.routes.home} component={Pages.Home} />
                  <Route exact path={'/' + Bank.routes.all} component={Pages.Accounts} />
                  <Route exact path={'/' + Bank.routes.view} component={Pages.BankView}/>
                  <Route exact path={'/' + Account.routes.view} component={Pages.AccountView}/>
                  <Route exact path={'/' + Transaction.routes.edit} component={Pages.TransactionEdit}/>
                  <Route exact path={'/' + Transaction.routes.view} component={Pages.TransactionView}/>
                  <Route exact path={'/' + Bill.routes.all} component={Pages.Bills}/>
                  <Route exact path={'/' + Budget.routes.all} component={Pages.Budgets}/>
                  <Route exact path={'/' + SyncConnection.routes.all} component={Pages.Syncs}/>
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
