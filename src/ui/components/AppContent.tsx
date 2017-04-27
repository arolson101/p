import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as R from 'ramda'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import * as SplitPane from 'react-split-pane'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
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

interface EnhancedProps {
  onSizeChange: (size: number) => void
}

interface UIState {
  sidebarWidth: number
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<any> & ReduxUIProps<UIState>

const enhance = compose<AllProps, {}>(
  setDisplayName('AppContent'),
  withRouter,
  onlyUpdateForPropTypes,
  setPropTypes({
    location: PropTypes.object
  }),
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
  }),
  withProps<EnhancedProps, ReduxUIProps<UIState> & ConnectedProps & RouteProps<any>>(
    ({ updateUI }) => ({
      onSizeChange: (sidebarWidth: number) => {
        updateUI({sidebarWidth} as UIState)
      }
    })
  )
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
  const { banks, ThemeNav, children, location: { pathname }, history, onSizeChange, ui: { sidebarWidth } } = props

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

  console.log('created href: ', history.createHref({pathname: '/a/b'}))

  return (
    <SplitPane
      split='vertical'
      minSize={100}
      defaultSize={sidebarWidth}
      onChange={onSizeChange}
    >
      <ThemeNav groups={groups} selectedId={selectedId} onClick={item => {
        const href = history.createHref({pathname: item.path})
        console.log('push: ', href)
        history.push(href)
      }} />
      <div style={{
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto'
      }}>
        {children}
      </div>
   </SplitPane>
  )
})
