import * as PropTypes from 'prop-types'
import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { goBack, goForward } from 'react-router-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import { DialogContainer, DialogDisplay } from '../dialogs'
import { AppState, mapDispatchToProps } from 'core/state'
import * as Mac from '../macOS'
import * as Win from '../windows'

export interface AppWindowProps {
  title: string
  onBack: Function
  onForward: Function
}

type RouteProps = RouteComponentProps<any>

interface ConnectedProps {
  ThemeWindow: any
}

interface DispatchProps {
  goBack: () => void
  goForward: () => void
}

type EnhancedProps = ConnectedProps & DispatchProps & RouteProps & React.Props<any>

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
    }),
    mapDispatchToProps<DispatchProps>({goBack, goForward})
  ),
)

export const AppWindow = enhance((props) => {
  const { ThemeWindow, goBack, goForward, children } = props
  const title = 'p: ' + props.location.pathname + props.location.hash + props.location.search

  return <div>
    <Helmet
      link={[
        {rel: 'stylesheet', type: 'text/css', href: 'lib/css/font-awesome.css'},
      ]}
    />
    <ThemeWindow title={title} onBack={goBack} onForward={goForward}>
      <DialogContainer.Component>
        <DialogDisplay/>
        {children}
      </DialogContainer.Component>
    </ThemeWindow>
  </div>
})
