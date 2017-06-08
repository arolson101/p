const autobind = require('autobind-decorator')
import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as R from 'ramda'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import * as SplitPane from 'react-split-pane'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { Bank, Account, Budget, Bill, SyncConnection } from '../../docs/index'
import { AppState } from '../../state/index'
import * as Mac from '../macOS/index'
import * as Win from '../windows/index'
import { RouteProps } from './props'

import './AppContent.css'

export interface NavItem {
  id: string
  icon: string
  path: string
  title: string
  account?: Account.View
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export interface NavProps {
  groups: NavGroup[]
  selectedId: string
  onClick: (item: NavItem) => void
}

const appGroup: NavGroup = {
  title: 'root',
  items: [
    {
      id: '_home',
      icon: 'fa fa-home',
      path: '/home',
      title: 'home'
    },
    {
      id: '_accounts',
      icon: Account.icon,
      path: '/banks',
      title: 'accounts'
    },
    {
      id: '_bills',
      icon: Bill.icon,
      path: '/bills',
      title: 'bills'
    },
    {
      id: '_budgets',
      icon: Budget.icon,
      path: '/budgets',
      title: 'budgets'
    },
    {
      id: '_syncs',
      icon: SyncConnection.icon,
      path: '/syncs',
      title: 'syncs'
    }
  ]
}

interface ConnectedProps {
  ThemeNav: React.StatelessComponent<NavProps>
  banks: Bank.View[]
}

interface UIState {
  sidebarWidth: number
}

type EnhancedProps = ConnectedProps & RouteProps<any> & ReduxUIProps<UIState>

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('AppContent'),
  withRouter,
  connect<ConnectedProps, {}, RouteProps<any>>(
    (state: AppState): ConnectedProps => ({
      ThemeNav: state.sys.theme === 'macOS' ? Mac.AppNav : Win.AppNav as any,
      banks: state.db.current!.view.banks
    })
  ),
  ui<UIState, ConnectedProps & RouteProps<any>, {}>({
    key: 'AppContent',
    persist: true,
    state: {
      sidebarWidth: 250
    } as UIState
  })
)

const makeAccountList = R.pipe(
  R.chain((bank: Bank.View) => bank.accounts),
  R.map((account: Account.View): NavItem => ({
    id: account.doc._id,
    icon: Account.icons[account.doc.type],
    path: Account.to.view(account.doc),
    title: account.doc.name,
    account
  })),
  R.sortBy((item: NavItem) => item.title.toLocaleLowerCase()),
  R.sortBy((item: NavItem) => Object.keys(Account.Type).indexOf(item.account!.doc.type).toString())
)

export interface AppContentContext {
  container: any
}

export const AppContentContextTypes: PropTypes.ValidationMap<AppContentContext> = {
  container: PropTypes.object
}

@onlyUpdateForPropTypes
class AppContentComponent extends React.Component<EnhancedProps, AppContentContext> {
  static childContextTypes = AppContentContextTypes
  static propTypes = {
    location: PropTypes.object
  }

  state = {
    container: undefined
  }

  getChildContext () {
    return this.state
  }

  render () {
    const { banks, ThemeNav, children, location: { pathname }, ui: { sidebarWidth } } = this.props

    const accountGroup: NavGroup = { title: 'accounts', items: makeAccountList(banks) }
    const groups = [appGroup, accountGroup]
    let selectedId = ''
    groups.forEach(group => {
      group.items.forEach(item => {
        if (pathname.startsWith(item.path)) {
          selectedId = item.id
        }
      })
    })

    return (
      <div
        className='modal-container'
        ref={this.setContainer}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <SplitPane
          split='vertical'
          minSize={100}
          defaultSize={sidebarWidth}
          onChange={this.onSizeChange}
        >
          <ThemeNav groups={groups} selectedId={selectedId} onClick={this.onNavClick} />
          <div
            style={{
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'auto'
            }}
          >
            {children}
          </div>
      </SplitPane>
    </div>
    )
  }

  @autobind
  onSizeChange (sidebarWidth: number) {
    const { updateUI } = this.props
    updateUI({sidebarWidth} as UIState)
  }

  @autobind
  setContainer (container: any) {
    this.setState({container})
  }

  @autobind
  onNavClick (item: NavItem) {
    const { history } = this.props
    history.push(item.path)
  }
}

export const AppContent = enhance(AppContentComponent)
