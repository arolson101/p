import * as History from 'history'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import * as React from 'react'
import { IndexRedirect, Router, Route, Link } from 'react-router'
import { routerActions } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { AppState, AppDispatch } from '../../modules'
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
    [{props.location!.pathname + ' ' + props.location!.search}]{' '}
    <Link to='/'>/</Link>{' '}
    <Link to='/dash'>/dash</Link>{' '}
    <Link to='/login'>/login</Link>{' '}
    {props.children}
  </div>
)

const Dashboard = () => (
  <div>dash</div>
)

interface Props {
  history: History.History
  store: Redux.Store<any>
}

interface ConnectedProps {
  locale: string
}

const NotFoundRoute = (params: Router.RouteComponentProps<any, any>) => (
  <div>not found: {params.location ? params.location.pathname : '(no location)'}</div>
)

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props
    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <MuiThemeProvider muiTheme={getMuiTheme()}>
            <Router history={history}>
              <Route path='/' component={Root}>
                <IndexRedirect to='login'/>
                <Route path='create' component={CreatePage}/>
                <Route path='login' component={LoginPage}/>
                <Route path='dash' component={DbIsOpen(Dashboard)}/>

                <Route path='*' component={NotFoundRoute} />
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
