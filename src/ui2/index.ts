import * as PropTypes from 'prop-types'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'

interface ReactUniversalProps {
  id?: string
}
type ComponentType<T> = React.ComponentType<T & ReactUniversalProps>

export interface UI {
  links: Array<{rel: 'stylesheet', type?: 'text/css', href: string}>
  Root: ComponentType<{
  }>
  Page: ComponentType<{
    title: FormattedMessage.MessageDescriptor
  }>
  Button: ComponentType<{
    primary?: boolean
    danger?: boolean
    fullWidth?: boolean
    onClick?: () => void
  }>
  List: ComponentType<{
    vertical?: boolean
  }>
  ListItem: ComponentType<{}>
}

export interface UIContext {
  UI: UI
}

export namespace UI {
  export type Context = UIContext
  export const contextTypes = { UI: PropTypes.object }
}

export class UIProvider extends React.Component<UIContext> {
  static childContextTypes = UI.contextTypes

  getChildContext () {
    const { UI } = this.props
    return { UI }
  }

  render () {
    return this.props.children
  }
}
