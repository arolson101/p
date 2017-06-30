import * as PropTypes from 'prop-types'
import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import { DialogContainer, DialogDisplay } from '../dialogs/index'
import { AppState } from '../../state/index'
import * as Mac from '../macOS/index'
import * as Win from '../windows/index'

export interface AppWindowProps {
  title: string
  onBack: Function
  onForward: Function
}

type RouteProps = RouteComponentProps<any>

interface ConnectedProps {
  ThemeWindow: any
}

interface Handlers {
  onBack: () => void
  onForward: () => void
}

type EnhancedProps = Handlers & ConnectedProps & RouteProps & React.Props<any>

const enhance = compose<EnhancedProps, {}>(
  setDisplayName('AppWindow'),
  withRouter,
  onlyUpdateForPropTypes,
  setPropTypes({
    location: PropTypes.object
  }),
  connect<ConnectedProps, {}, RouteProps>(
    (state: AppState) => ({
      ThemeWindow: state.sys.theme === 'macOS' ? Mac.AppWindow : Win.AppWindow
    })
  ),
  withHandlers<Handlers, ConnectedProps & RouteProps>({
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
      <DialogContainer.Component>
        <DialogDisplay/>
        {children}
      </DialogContainer.Component>
    </ThemeWindow>
  </div>
})
