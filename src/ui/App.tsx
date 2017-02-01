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
    const { db: { current } } = store.getState()
    if (!current) {
      replace({
        pathname: '/',
        state: { nextPathname: nextState.location.pathname }
      })
    }
  }

const AppRoutes = ({store, history}: any) =>
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

import { Window, Text, TitleBar, Toolbar, SearchField, Button, Label } from 'react-desktop/macOs'
// import 'photonkit/dist/css/photon.css'

const toolbarButtonStyle = {height: 24, width: 28, padding: 0}

const Test = ({history, store}: any) =>
  <Window
    chrome
    padding='10px'
  >
    <TitleBar inset controls >
      <Toolbar height='36' horizontalAlignment='left' >
        <Button style={toolbarButtonStyle} marginLeft={10}>
          <i className='fa fa-angle-left fa-lg' style={{color: 'darkgrey'}}/>
        </Button>
        <Button style={toolbarButtonStyle}>
          <i className='fa fa-angle-right fa-lg' style={{color: 'darkgrey'}}/>
        </Button>
      </Toolbar>

      <Label horizontalAlignment='center'>p</Label>

      <Toolbar horizontalAlignment='right'>
        <SearchField
          placeholder='Search'
          defaultValue=''
        />
      </Toolbar>
    </TitleBar>
    <AppRoutes history={history} store={store}/>
  </Window>


const TestPhoton = (props: any) =>
  <header className='toolbar toolbar-header'>
    <h1 className="title">Header with actions</h1>
    <div className='toolbar-actions' height='40'>
      <div className='btn-group'>
        <button className='btn btn-default'>
          <span className='icon icon-home'></span>
        </button>
        <button className='btn btn-default'>
          <span className='icon icon-folder'></span>
        </button>
        <button className='btn btn-default active'>
          <span className='icon icon-cloud'></span>
        </button>
        <button className='btn btn-default'>
          <span className='icon icon-popup'></span>
        </button>
        <button className='btn btn-default'>
          <span className='icon icon-shuffle'></span>
        </button>
      </div>

      <button className='btn btn-default'>
        <span className='icon icon-home icon-text'></span>
        Filters
      </button>

      <button className='btn btn-default btn-dropdown pull-right'>
        <span className='icon icon-megaphone'></span>
      </button>
    </div>
  </header>


class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <Test history={history} store={store}/>
        </IntlProvider>
      </Provider>
    )
  }
}

export const App = connect(
  (state: AppState): ConnectedProps => ({ locale: state.i18n.locale })
)(AppComponent) as React.ComponentClass<Props>
