import * as React from 'react'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { RouteProps } from './props'
import * as Mac from '../macOS'
import * as Win from '../windows'

export interface AppWindowProps {
  title: string
  onBack: Function
  onForward: Function
}

interface EnhancedProps {
  AppWindow: any
  onBack: () => void
  onForward: () => void
}

type AllProps = EnhancedProps & RouteProps<any>

const enhance = compose<AllProps, RouteProps<any>>(
  setDisplayName('Root'),
  onlyUpdateForPropTypes,
  setPropTypes({
    location: React.PropTypes.object
  }),
  withProps<EnhancedProps, RouteProps<any>>(
    ({router}) => ({
      AppWindow: Win.AppWindow,

      onBack: () => {
        router.goBack()
      },

      onForward: () => {
        router.goForward()
      }
    })
  )
)

export const Root = enhance(props => {
  const { AppWindow, onBack, onForward, children } = props
  const title = 'p: ' + props.location.pathname + props.location.search

  return <AppWindow title={title} onBack={onBack} onForward={onForward}>
    {children}
  </AppWindow>
})
