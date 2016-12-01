import * as History from 'history'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import * as React from 'react'
import { IndexRoute, Router, Route } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect, Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { AppState, AppDispatch } from '../state'
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

const Dummy = (name: string) =>
  (props: Router.RouteComponentProps<any, any>) => (
    <div>{name} {props.params.institution}{props.children}</div>
  )

class AppComponent extends React.Component<Props & ConnectedProps, any> {
  render() {
    const { store, locale, history } = this.props

    return (
      <Provider store={store}>
        <IntlProvider locale={locale}>
          <MuiThemeProvider muiTheme={getMuiTheme()}>
            <Router history={history}>
              <Route path='/' component={Components.Root}>
                <IndexRoute component={Components.DbIndex}/>
                <Route path='create' component={Components.DbCreate}/>
                <Route path=':db/' component={Components.DbRoot}>
                  <IndexRoute component={Components.DbView}/>
                  <Route path='create' component={Components.InCreate}/>
                  <Route path=':institution/' component={Dummy('InRoot')}>
                    <IndexRoute component={Dummy('InView')}/>
                    <Route path=':account/' component={Dummy('AccountRoot')}>
                      <IndexRoute component={Dummy('AccountView')}/>
                      <Route path='create' component={Dummy('AccountCreate')}/>
                    </Route>
                  </Route>
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
