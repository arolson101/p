import * as PropTypes from 'prop-types'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { compose, withState, withContext, getContext, setDisplayName } from 'recompose'

export interface UI {
  Root: React.ComponentType<{
  }>
  Page: React.ComponentType<{
    id: string
    title: FormattedMessage.MessageDescriptor
  }>
  Button: React.ComponentType<{
    primary?: boolean
    danger?: boolean
    onClick?: () => void
  }>
}

export interface UIContextProps {
  UI: UI
}

const UIChildContextTypes = { UI: PropTypes.object }

const enhanceUIContext = compose<UIContextProps, UIContextProps>(
  setDisplayName('UIContext'),
  withContext<UIContextProps, UIContextProps>(
    UIChildContextTypes,
    ({ UI }): UIContextProps => ({ UI })
  )
)

export const UIContext = enhanceUIContext(({ children }) =>
  children as any
)

export const withUI = getContext<UIContextProps>(UIChildContextTypes)
