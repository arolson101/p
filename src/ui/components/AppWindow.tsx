import * as React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { AppState } from '../../state'
import * as Mac from '../macOS'
import * as Win from '../windows'
import { RouteProps } from './props'

export interface AppWindowProps {
  title: string
  onBack: Function
  onForward: Function
}

interface ConnectedProps {
  ThemeWindow: any
}

interface EnhancedProps {
  onBack: () => void
  onForward: () => void
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, RouteProps<any>>(
  setDisplayName('Root'),
  onlyUpdateForPropTypes,
  setPropTypes({
    location: React.PropTypes.object
  }),
  connect<ConnectedProps, {}, RouteProps<any>>(
    (state: AppState) => ({
      ThemeWindow: state.sys.theme === 'macOS' ? Mac.AppWindow : Win.AppWindow
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

export const AppWindow = enhance(props => {
  const { ThemeWindow, onBack, onForward, children } = props
  const title = 'p: ' + props.location.pathname + props.location.search

  return <ThemeWindow title={title} onBack={onBack} onForward={onForward}>
    {children}
  </ThemeWindow>
})
