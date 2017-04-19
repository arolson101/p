import * as PropTypes from 'prop-types'
import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { AppState } from '../../state/index'
import * as Mac from '../macOS/index'
import * as Win from '../windows/index'
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

const enhance = compose<AllProps, void>(
  setDisplayName('AppWindow'),
  onlyUpdateForPropTypes,
  withRouter,
  setPropTypes({
    location: PropTypes.object
  }),
  connect<ConnectedProps, {}, RouteProps<any>>(
    (state: AppState) => ({
      ThemeWindow: state.sys.theme === 'macOS' ? Mac.AppWindow : Win.AppWindow
    })
  ),
  withProps<EnhancedProps, ConnectedProps & RouteProps<any>>(
    ({history}) => ({
      onBack: () => {
        history.goBack()
      },

      onForward: () => {
        history.goForward()
      }
    })
  )
)

export const AppWindow = enhance(props => {
  const { ThemeWindow, onBack, onForward, children } = props
  const title = 'p: ' + props.location.pathname + props.location.search

  return <div>
    <Helmet
      link={[
        {rel: 'stylesheet', type: 'text/css', href: 'lib/css/font-awesome.css'},
      ]}
    />
    <ThemeWindow title={title} onBack={onBack} onForward={onForward}>
      {children}
    </ThemeWindow>
  </div>
})
