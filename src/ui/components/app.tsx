import * as History from 'history'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import * as React from 'react'
import { IndexRoute, Router, Route, Link } from 'react-router'
import { routerActions } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { AppState, AppDispatch, historyAPI } from '../../modules'
import { CreatePage, LoginPage } from '../pages'

const DbIsOpen = UserAuthWrapper({
  failureRedirectPath: '/login',
  authSelector: (state: AppState) => state.db.current,
  redirectAction: routerActions.replace, // the redux action to dispatch for redirect
  wrapperDisplayName: 'DbIsOpen' // a nice name for this auth check
})

// const DbsExist = UserAuthWrapper({
//   failureRedirectPath: '/create',
//   authSelector: (state: AppState) => state.db.all.length > 0,
//   redirectAction: routerActions.replace, // the redux action to dispatch for redirect
//   wrapperDisplayName: 'DbsExist' // a nice name for this auth check
// })

const Root = (props: Router.RouteComponentProps<any, any>) => (
  <div>
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goBack()
    }}>&lt;</a>{' '}
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goForward()
    }}>&gt;</a>{' '}
    [ {props.location!.pathname + ' ' + props.location!.search} ]{' '}
    <Link to='/'>/</Link>{' '}
    <Link to='/asdf/foo'>/asdf</Link>{' '}
    <Link to='/login'>/login</Link>{' '}
    {props.children}
  </div>
)

const Dashboard = (params: Router.RouteComponentProps<any, any>) => (
  <div>dash {params.children}</div>
)

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

const DbRoot = (props: Router.RouteComponentProps<any, any>) => (
  <div>DbRoot {props.children}</div>
)

const Institution = (props: Router.RouteComponentProps<any, any>) => (
  <div>Institution {props.params.institution}{props.children}</div>
)
const PasswordPage = (props: Router.RouteComponentProps<any, any>) => (
  <div>PasswordPage {props.params.institution}{props.children}</div>
)

const checkValidDb = (store: Redux.Store<AppState>): Router.EnterHook =>
  async (nextState, replace, callback) => {
    const { db } = nextState.params
    const { current, meta } = store.getState().db
    if (!current || current._id !== db) {
      try {
        await meta!.handle.get(db)
        replace({ pathname: `/${db}/password`, query: { pathname: nextState.location.pathname } })
      } catch (ex) {
        replace({ pathname: '/missing', query: { pathname: nextState.location.pathname } })
      }
    }
    callback!()
}

const checkAuthenticated = (store: Redux.Store<AppState>): Router.EnterHook =>
  (nextState, replace, callback) => {
    const { db } = nextState.params
    const { current } = store.getState().db
    if (!current || current._id !== db) {
      replace({ pathname: `/${db}/` })
    }
    callback!()
}

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <MuiThemeProvider muiTheme={getMuiTheme()}>
            <Router history={history}>
              <Route path='/' component={Root}>
                <IndexRoute component={LoginPage}/>
                <Route path='create' component={CreatePage}/>
                <Route path='missing' component={NotFoundRoute}/>

                <Route path=':db' component={DbRoot} onEnter={checkValidDb(store)}>
                  <Route path='password' component={PasswordPage}/>
                  <IndexRoute component={DbRoot}/>
                  <Route path=':institution' component={Institution} onEnter={checkAuthenticated(store)}/>
                </Route>

                <Route path='*' component={NotFoundRoute}/>
              </Route>
            </Router>
          </MuiThemeProvider>
        </IntlProvider>
      </Provider>
    )
  }
}

export const App = connect(
  (state: AppState): ConnectedProps => ({ locale: state.i18n.locale }),
  (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
)(AppComponent) as React.ComponentClass<Props>
