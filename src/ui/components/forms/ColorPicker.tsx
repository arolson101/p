import * as React from 'react'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { SketchPicker } from 'react-color'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'

import './ColorPicker.css'

export interface ColorPickerProps {
}

interface Props extends ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
}

interface EnhancedProps {
  handleChange: (color: ReactColor.ColorResult) => void
}

type AllProps = EnhancedProps & Props

const enhance = compose<AllProps, Props>(
  setDisplayName('ColorPicker'),
  onlyUpdateForPropTypes,
  setPropTypes({
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  } as PropTypes<ColorPickerProps>),
  withHandlers<AllProps, AllProps>({
    handleChange: ({onChange}) => (color: ReactColor.ColorResult) => {
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
