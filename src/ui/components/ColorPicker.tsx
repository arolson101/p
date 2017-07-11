import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { SketchPicker, ColorResult } from 'react-color'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'

import './ColorPicker.css'

export interface ColorPickerProps {
}

interface Props extends ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
}

interface Handlers {
  handleChange: (color: ColorResult) => void
}

type EnhancedProps = Handlers & Props

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('ColorPicker'),
  onlyUpdateForPropTypes,
  setPropTypes({
    value: PropTypes.string,
    onChange: PropTypes.func
  } as PropTypes<ColorPickerProps>),
  withHandlers<EnhancedProps, EnhancedProps>({
    handleChange: ({onChange}) => (color: ColorResult) => {
      if (onChange) {
        onChange(color.hex)
      }
    }
  })
)

export const ColorPicker = enhance(props => {
  const { handleChange, value } = props
  const styles = {
    color: {
      width: '26px',
      height: '20px',
      borderRadius: '2px',
      background: value,
    },
    swatch: {
      background: '#fff',
      borderRadius: '1px',
      display: 'inline-block',
      cursor: 'pointer',
    }
  }

  return (
    <OverlayTrigger
      trigger='click'
      placement='bottom'
      rootClose
      overlay={
        <Popover id='popover-trigger-focus' style={{padding: 0}}>
          <SketchPicker color={value} onChange={handleChange} />
        </Popover>
      }
    >
      <Button>
        <div style={ styles.color } />
      </Button>
    </OverlayTrigger>
  )
})
