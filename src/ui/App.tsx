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
            <Route exact path='/' component={Components.Login}/>
            {current ? (
              <Components.AppContent>
                <Switch>
                  <Route exact path={'/' + DbInfo.routes.home} component={Components.Home} />
                  <Route exact path={'/' + Bank.routes.all} component={Components.Accounts} />
                  <Route exact path={'/' + Bank.routes.view} component={Components.BankView}/>
                  <Route exact path={'/' + Account.routes.view} component={Components.AccountView}/>
                  <Route exact path={'/' + Transaction.routes.edit} component={Components.TransactionEdit}/>
                  <Route exact path={'/' + Transaction.routes.view} component={Components.TransactionView}/>
                  <Route exact path={'/' + Bill.routes.all} component={Components.Bills}/>
                  <Route exact path={'/' + Budget.routes.all} component={Components.Budgets}/>
                  <Route exact path={'/' + SyncConnection.routes.all} component={Components.Syncs}/>
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
