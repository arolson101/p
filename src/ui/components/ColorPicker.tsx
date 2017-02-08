import * as React from 'react'
import { SketchPicker } from 'react-color'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, withState } from 'recompose'

export interface ColorPickerProps {
}

interface Props extends ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
}

interface EnhancedProps {
  displayColorPicker?: string
  setDisplayColorPicker: (displayColorPicker: boolean) => void
  handleClick: () => void
  handleClose: () => void
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
  withState('displayColorPicker', 'setDisplayColorPicker', false),
  withHandlers<AllProps, AllProps>({
    handleClick: ({setDisplayColorPicker, displayColorPicker}) => () => {
      setDisplayColorPicker(!displayColorPicker)
    },

    handleClose: ({setDisplayColorPicker}) => () => {
      setDisplayColorPicker(false)
    },

    handleChange: ({onChange}) => (color: ReactColor.ColorResult) => {
      if (onChange) {
        onChange(color.hex)
      }
    }
  })
)

export const ColorPicker = enhance(props => {
  const { handleClick, handleChange, handleClose, displayColorPicker, value } = props
  const styles = {
    color: {
      width: '26px',
      height: '16px',
      borderRadius: '2px',
      background: value,
    },
    swatch: {
      background: '#fff',
      borderRadius: '1px',
      boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
      display: 'inline-block',
      cursor: 'pointer',
    },
    popover: {
      position: 'absolute',
      zIndex: 5,
    },
    cover: {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    }
  }

  return (
    <div>
      <div style={ styles.swatch } onClick={handleClick}>
        <div style={ styles.color } />
      </div>
      {displayColorPicker &&
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose}/>
          <SketchPicker color={value} onChange={handleChange} />
        </div>
      }
    </div>
  )
})
