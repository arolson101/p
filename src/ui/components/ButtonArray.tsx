import * as R from 'ramda'
import * as React from 'react'
import { ButtonGroup, ButtonToolbar, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { withPropChangeCallback } from '../enhancers/withPropChangeCallback'

type Type = 'daysOfWeek' | 'daysOfMonth' | 'months'

export interface ButtonArrayProps {
  values: string[]
  strings: string[]
  maxPerRow: number
  buttonWidth?: number
  buttonHeight?: number
  value?: string
  onChange?: (newValue: string) => void
}

interface EnhancedProps {
  booleanValues: boolean[]
}

type AllProps = EnhancedProps & ButtonArrayProps

const enhance = compose<AllProps, ButtonArrayProps>(
  setDisplayName('ButtonArray'),
  withProps((props: ButtonArrayProps) => {
    const toggle = (val: string) => {
      if (props.onChange) {
        const trueValues = toBooleanArray(props.values, props.value || '')
        const idx = props.values.indexOf(val)
        trueValues[idx] = !trueValues[idx]
        const value = props.values.filter((val, idx) => trueValues[idx]).join(',')
        props.onChange(value)
      }
    }
    const handlers = {} as any
    props.values.forEach(value => handlers['onChange' + value] = () => toggle(value))
    return handlers
  })
)

const toBooleanArray = (values: string[], value: string): boolean[] => {
  const trueValues = value.split(',')
  const booleanValues = values.map((str) => (trueValues.indexOf(str) !== -1))
  return booleanValues
}

export const ButtonArray = enhance((props) => {
  const { values, value, strings, maxPerRow, buttonWidth, buttonHeight } = props
  const booleanValues = toBooleanArray(values, value || '')
  return (
    <ButtonToolbar>
      <ButtonGroup>
      {values.map((value, idx) => [
        <Button
          onClick={(props as any)['onChange' + value]}
          key={value}
          style={{width: buttonWidth, height: buttonHeight}}
          active={booleanValues[idx]}
        >
          {strings[idx]}
        </Button>,
        ((idx % maxPerRow) === (maxPerRow - 1)) && <br/>
      ])}
      </ButtonGroup>
    </ButtonToolbar>
  )
})
