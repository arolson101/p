import * as History from 'history'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import * as React from 'react'
import { IndexRedirect, Router, Route, Link } from 'react-router'
import { routerActions } from 'react-router-redux'
import { bindActionCreators } from 'redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { AppState, AppDispatch } from '../../modules'
import { LoginPage } from '../pages'

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: (state: AppState) => state.db.current,
  redirectAction: routerActions.replace, // the redux action to dispatch for redirect
  wrapperDisplayName: 'UserIsAuthenticated' // a nice name for this auth check
})

const Root = (props: Router.RouteComponentProps<any, any>) => {
  return <div>
    [{props.location!.pathname + ' ' + props.location!.search}]{' '}
    <Link to='/'>/</Link>{' '}
    <Link to='/dash'>/dash</Link>{' '}
    <Link to='/login'>/login</Link>{' '}
    {props.children}
  </div>
}

const Dashboard = () => {
  return <div>dash</div>
}

interface Props {
  history: History.History
  store: Redux.Store<any>
}

interface ConnectedProps {
  locale: string
}

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props
    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <MuiThemeProvider>
            <Router history={history}>
              <Route path='/' component={Root}>
                <IndexRedirect to='/login'/>
                <Route path='login' component={LoginPage}/>
                <Route path='dash' component={UserIsAuthenticated(Dashboard)}/>
              </Route>
            </Router>
          </MuiThemeProvider>
        </IntlProvider>
      </Provider>
    )
  }
}

export const App = connect(
  (state: AppState) => ({ locale: state.i18n.locale }) as ConnectedProps,
  (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
)(AppComponent) as React.ComponentClass<Props>
