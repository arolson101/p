import * as PropTypes from 'prop-types'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { compose, withState, withContext, getContext, setDisplayName } from 'recompose'

export interface UI {
  links: Array<{rel: 'stylesheet', type?: 'text/css', href: string}>
  Root: React.ComponentType<{
  }>
  Page: React.ComponentType<{
    title: FormattedMessage.MessageDescriptor
  }>
  Button: React.ComponentType<{
    primary?: boolean
    danger?: boolean
    onClick?: () => void
  }>
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
    return this.props.children as any
  }
}
