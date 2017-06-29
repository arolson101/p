import * as PropTypes from 'prop-types'
import * as React from 'react'
import { ButtonGroup, DropdownButton, MenuItem, MenuItemProps } from 'react-bootstrap'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'

const messages = defineMessages({
  options: {
    id: 'SettingsMenu.options',
    defaultMessage: 'Options'
  }
})

interface Item extends MenuItemProps {
  message?: string | FormattedMessage.MessageDescriptor
  to?: string
}

interface Props {
  items: (Item | false)[]
}

type EnhancedProps = Props & RouteComponentProps<any> & IntlProps

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('SettingsMenu'),
  withRouter,
  onlyUpdateForPropTypes,
  setPropTypes({
    items: PropTypes.array.isRequired
  } as PropTypes<Props>),
  injectIntl
)

export const SettingsMenu = enhance((props) => {
  const { items, history, intl: { formatMessage } } = props
  return (
    <ButtonGroup className='pull-right'>
      <DropdownButton bsSize='small' id='in-action-menu' title={formatMessage(messages.options)} pullRight>
        {items.map((item, index) => {
          if (!item) {
            return
          }
          const { message, to, ...menuItemProps } = item
          const key = message ? (typeof message === 'string' ? message : message.id) : index
          if (to) {
            menuItemProps.href = history.createHref({pathname: to})
          }
          return (
            <MenuItem key={key} {...menuItemProps}>
              {message && (typeof message === 'string'
                ? message
                : <FormattedMessage {...message}/>
              )}
            </MenuItem>
          )
        })}
      </DropdownButton>
    </ButtonGroup>
  )
})
