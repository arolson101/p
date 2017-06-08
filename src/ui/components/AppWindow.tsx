import * as PropTypes from 'prop-types'
import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
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

interface Handlers {
  onBack: () => void
  onForward: () => void
}

type EnhancedProps = Handlers & ConnectedProps & RouteProps<any> & React.Props<any>

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('AppWindow'),
  withRouter,
  onlyUpdateForPropTypes,
  setPropTypes({
    location: PropTypes.object
  }),
  connect<ConnectedProps, {}, RouteProps<any>>(
    (state: AppState) => ({
      ThemeWindow: state.sys.theme === 'macOS' ? Mac.AppWindow : Win.AppWindow
    })
  ),
  withHandlers<Handlers, ConnectedProps & RouteProps<any>>({
    onBack: ({history}) => () => {
      history.goBack()
    },
    onForward: ({history}) => () => {
      history.goForward()
    }
  })
)

export const AppWindow = enhance((props) => {
  const { ThemeWindow, onBack, onForward, children } = props
  const title = 'p: ' + props.location.pathname + props.location.hash + props.location.search

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
