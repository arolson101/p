import * as PropTypes from 'prop-types'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'

interface ReactUniversalProps {
  id?: string
}
type ComponentType<T> = React.ComponentType<T & ReactUniversalProps>

export interface Components {
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

export interface AccountDeleteState {
  deleting?: boolean
  error?: Error
}

export type UiState = {
  Components: Components
  accountDelete: AccountDeleteState
}

const invalidComponent = () => {
  throw new Error('invalid component')
}

const invalidComponents: Components = {
  links: [],
  Root: invalidComponent,
  Page: invalidComponent,
  Button: invalidComponent,
  List: invalidComponent,
  ListItem: invalidComponent,
}

const initialState: UiState = {
  Components: invalidComponents,
  accountDelete: {}
}

export const UI_SET_ACCOUNTDELETE = 'ui/setAccountDelete'

export interface SetAccountDeleteAction {
  type: typeof UI_SET_ACCOUNTDELETE,
  accountDelete: AccountDeleteState
}

export const uiSetAccountDelete = (accountDelete: AccountDeleteState): SetAccountDeleteAction => ({
  type: UI_SET_ACCOUNTDELETE,
  accountDelete
})

type Actions =
  SetAccountDeleteAction |
  EmptyAction

const reducer = (state: UiState = initialState, action: Actions): UiState => {
  switch (action.type) {
    case UI_SET_ACCOUNTDELETE:
      return { ...state, accountDelete: { ...state.accountDelete, ...action.accountDelete } }

    default:
      return state
  }
}

export interface UiSlice {
  ui: UiState
}

export const UiSlice = {
  ui: reducer
}
