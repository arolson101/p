import * as React from 'react'
import { connect } from 'react-redux'
import * as SplitPane from 'react-split-pane'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { Bank, Account } from '../../docs'
import { AppState } from '../../state'
import * as Mac from '../macOS'
import * as Win from '../windows'
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
      icon: 'fa fa-home',
      path: '/banks',
      title: 'accounts'
    },
    {
      id: '_bills',
      icon: 'fa fa-home',
      path: '/bills',
      title: 'bills'
    }
  ]
}

interface ConnectedProps {
  ThemeNav: React.StatelessComponent<NavProps>
  banks: Bank.View[]
}

interface EnhancedProps {
  onBack: () => void
  onForward: () => void
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, RouteProps<any>>(
  setDisplayName('AppContent'),
  onlyUpdateForPropTypes,
  setPropTypes({
    location: React.PropTypes.object
  }),
  connect<ConnectedProps, {}, RouteProps<any>>(
    (state: AppState): ConnectedProps => ({
      ThemeNav: state.sys.theme === 'macOS' ? Mac.AppNav : Win.AppNav,
      banks: state.db.current!.view.banks
    })
  ),
  withProps<EnhancedProps, ConnectedProps & RouteProps<any>>(
    ({router}) => ({
      onBack: () => {
        router.goBack()
      },

      onForward: () => {
        router.goForward()
      }
    })
  )
)

export const AppContent = enhance(props => {
  const { banks, ThemeNav, children, location: { pathname }, router } = props

  const accountGroup: NavGroup = { title: 'accounts', items: [] }
  banks.forEach(bank => {
    bank.accounts.forEach(account => {
      accountGroup.items.push({
        id: account.doc._id,
        icon: Account.icons[account.doc.type],
        path: Account.to.view(account.doc),
        title: account.doc.name,
        account
      })
    })
  })
  const groups = [appGroup, accountGroup]
  let selectedId = appGroup.items[0].id
  groups.forEach(group => {
    group.items.forEach(item => {
      if (pathname.startsWith(item.path)) {
        selectedId = item.id
      }
    })
  })

  return (
    <SplitPane split='vertical' minSize={100} defaultSize={200}>
      <ThemeNav groups={groups} selectedId={selectedId} onClick={item => router.push(item.path)} />
      <div style={{flex: 1, backgroundColor: 'white'}}>
        {children}
      </div>
   </SplitPane>
  )
})
