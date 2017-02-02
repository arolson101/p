import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
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
    (state: AppState) => ({
      ThemeNav: state.sys.theme === 'macOS' ? Mac.AppNav : Win.AppNav
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
  const { ThemeNav, children, location: { pathname }, router } = props
  const selectedIndex = navItems.findIndex(item => pathname.startsWith(item.path))

  return <ThemeNav items={navItems} selectedIndex={selectedIndex} onClick={item => router.push(item.path)}>
    {children}
  </ThemeNav>
})
