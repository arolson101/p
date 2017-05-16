import * as PropTypes from 'prop-types'
import * as React from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import { Favico } from './Favico'

const messages = defineMessages({
  reDownload: {
    id: 'IconPicker.reDownload',
    defaultMessage: 'Re-download icon'
  },
  remove: {
    id: 'IconPicker.remove',
    defaultMessage: 'Remove icon'
  },
})

export interface IconPickerProps {
}

interface Props extends IconPickerProps {
  value?: string
  onChange?: (value: any, newValue: any, previousValue: any) => void
}

interface EnhancedProps {
  onMenuItem: (eventKey: any) => void
}

type AllProps = EnhancedProps & Props

type EventKey = 'redownload' | 'remove'

const enhance = compose<AllProps, Props>(
  setDisplayName('IconPicker'),
  onlyUpdateForPropTypes,
  setPropTypes({
    value: PropTypes.string,
    onChange: PropTypes.func
  } as PropTypes<IconPickerProps>),
  withHandlers<EnhancedProps, Props>({
    onMenuItem: (props) => (eventKey: EventKey) => {
      if (!props.onChange) {
        return
      }

      switch (eventKey) {
        case 'redownload':
          props.onChange(undefined, undefined, undefined)
          break

        case 'remove':
          props.onChange('', '', undefined)
          break
      }
    }
  })
)

export const IconPicker = enhance(props => {
  const { value } = props
  return (
    <DropdownButton
      style={{minWidth: 50}}
      id='icon-picker'
      onSelect={props.onMenuItem}
      title={
        <Favico value={value}/> as any
      }
    >
      <MenuItem eventKey={'redownload'}>
        <FormattedMessage {...messages.reDownload}/>
      </MenuItem>
      <MenuItem eventKey={'remove'}>
        <FormattedMessage {...messages.remove}/>
      </MenuItem>
    </DropdownButton>
  )
})
