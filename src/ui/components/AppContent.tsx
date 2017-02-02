import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { Bank, Account } from '../../docs'
import { AppState } from '../../state'
import * as Mac from '../macOS'
import * as Win from '../windows'
import { RouteProps } from './props'

export interface NavItem {
  icon: string
  path: string
  title: string
}

export interface NavProps {
  items: NavItem[]
  selectedIndex: number
  onClick: (item: NavItem) => void
}

const navItems: NavItem[] = [
  {
    icon: 'fa fa-home',
    path: '/home',
    title: 'home'
  },
  {
    icon: 'fa fa-home',
    path: '/banks',
    title: 'accounts'
  },
  {
    icon: 'fa fa-home',
    path: '/bills',
    title: 'bills'
  }
]

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

  const items = [...navItems]
  banks.forEach(bank => {
    bank.accounts.forEach(account => {
      items.push({
        icon: Account.icons[account.doc.type],
        path: Account.to.view(account.doc),
        title: account.doc.name
      })
    })
  })
  const selectedIndex = items.findIndex(item => pathname.startsWith(item.path))

  return <ThemeNav items={items} selectedIndex={selectedIndex} onClick={item => router.push(item.path)}>
    {children}
  </ThemeNav>
})
