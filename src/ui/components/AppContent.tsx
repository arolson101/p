import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as R from 'ramda'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import * as SplitPane from 'react-split-pane'
import { compose, setDisplayName, setPropTypes, withState, withHandlers } from 'recompose'
import { Account, Budget, Bill, SyncConnection } from 'core/docs'
import { selectAccounts } from 'core/selectors'
import { AppState } from 'core/state'
import * as Mac from '../macOS'
import * as Win from '../windows'

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

type RouteProps = RouteComponentProps<any>

interface ConnectedProps {
  ThemeNav: React.StatelessComponent<NavProps>
  accounts: Account.View[]
}

interface State {
  sidebarWidth: number
  setSidebarWidth: (sidebarWidth: number) => void
}

interface Handlers {
  onSizeChange: (sidebarWidth: number) => void
  onNavClick: (item: NavItem) => void
}

type EnhancedProps = Handlers & ConnectedProps & RouteProps & State

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('AppContent'),
  // onlyUpdateForPropTypes,
  setPropTypes({
    location: PropTypes.object
  }),
  withRouter,
  connect<ConnectedProps, {}, RouteProps>(
    (state: AppState): ConnectedProps => ({
      ThemeNav: state.sys.theme === 'macOS' ? Mac.AppNav : Win.AppNav as any,
      accounts: selectAccounts(state)
    })
  ),
  withState('sidebarWidth', 'setSidebarWidth', 250),
  withHandlers<State & ConnectedProps & RouteProps, Handlers>({
    onSizeChange: ({ setSidebarWidth }) => (sidebarWidth: number) => {
      setSidebarWidth(sidebarWidth)
    },
    onNavClick: ({ history }) => (item: NavItem) => {
      history.push(item.path)
    }
  })
)

const makeAccountList = R.pipe(
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

export const AppContent = enhance(props => {
  const { accounts, ThemeNav, children, onSizeChange, onNavClick, location: { pathname }, sidebarWidth } = props

  const accountGroup: NavGroup = { title: 'accounts', items: makeAccountList(accounts) }
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
    <SplitPane
      split='vertical'
      minSize={100}
      defaultSize={sidebarWidth}
      onChange={onSizeChange}
    >
      <ThemeNav groups={groups} selectedId={selectedId} onClick={onNavClick} />
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
  )
})
