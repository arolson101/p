import * as History from 'history'
import * as React from 'react'
import { Router, Route, IndexRoute } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { DbInfo, Institution } from '../docs'
import { AppState, AppDispatch, unloadDb } from '../state'
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
      store.dispatch(unloadDb())
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
              <IndexRoute component={Components.DbLogin}/>
              <Route path='logout' onEnter={logout(store)}/>
              <Route path={DbInfo.create} component={Components.DbCreate}/>
              <Route path={DbInfo.route} component={Components.DbView}/>
              <Route onEnter={requireAuth(store)}>
                <Route path={Institution.create} component={Components.InCreate}/>
                <Route path={Institution.route} component={Components.InView}/>
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
  (state: AppState): ConnectedProps => ({ locale: state.i18n.locale }),
  (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
)(AppComponent) as React.ComponentClass<Props>
