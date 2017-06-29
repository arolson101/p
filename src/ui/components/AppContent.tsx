import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as R from 'ramda'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import * as SplitPane from 'react-split-pane'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withState, withHandlers, withContext } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { Bank, Account, Budget, Bill, SyncConnection } from '../../docs/index'
import { AppState } from '../../state/index'
import { DialogContainer, DialogDisplay } from '../dialogs/index'
import * as Mac from '../macOS/index'
import * as Win from '../windows/index'

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
  banks: Bank.View[]
}

interface UIState {
  sidebarWidth: number
}

interface Handlers {
  onSizeChange: (sidebarWidth: number) => void
  onNavClick: (item: NavItem) => void
}

type EnhancedProps = Handlers & ConnectedProps & RouteProps & ReduxUIProps<UIState>

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
      banks: state.db.current!.view.banks
    })
  ),
  ui<UIState, ConnectedProps & RouteProps, {}>({
    key: 'AppContent',
    persist: true,
    state: {
      sidebarWidth: 250
    } as UIState
  }),
  withHandlers<Handlers, ReduxUIProps<UIState> & ConnectedProps & RouteProps>({
    onSizeChange: ({ updateUI }) => (sidebarWidth: number) => {
      updateUI({sidebarWidth} as UIState)
    },
    onNavClick: ({ history }) => (item: NavItem) => {
      history.push(item.path)
    }
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

export const AppContent = enhance(props => {
  const { banks, ThemeNav, children, onSizeChange, onNavClick, location: { pathname }, ui: { sidebarWidth } } = props

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
    <DialogContainer.Component>
      <DialogDisplay/>
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
  </DialogContainer.Component>
  )
})
