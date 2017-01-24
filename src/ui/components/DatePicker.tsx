import * as moment from 'moment'
import * as React from 'react'
import { FormControl } from 'react-bootstrap'
import * as RDatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { compose, withHandlers, withState } from 'recompose'
import { withPropChangeCallback } from '../enhancers'
import './DatePicker.css'

interface Props {
  value?: string
  onChange?: (value: string) => void
}

export type DatePickerProps = Partial<ReactDatePickerProps> & Props

type AllProps = Props & EnhancedProps

interface EnhancedProps {
  startDate?: moment.Moment
  setStartDate: (startDate?: moment.Moment) => void
  onChange: (value?: any) => void
  onInputChange: (event: any) => void
}

const enhance = compose<AllProps, Props>(
  withState('startDate', 'setStartDate', undefined),
  withPropChangeCallback('value', ({setStartDate, value}: AllProps) => {
    setStartDate(value ? convertToDate(value) : undefined)
  }),
  withHandlers<AllProps, AllProps>({
    onChange: ({onChange}: Props) => (value: Date) => {
      console.log('onChange', value)
      if (onChange) {
        onChange(moment(value).format('L'))
      }
    },
    onInputChange: ({onChange, setStartDate}) => (e: React.FormEvent<any>) => {
      const strValue = (e.target as any).value
      const value = convertToDate(strValue)
      if (value) {
        setStartDate(value)
      }
      if (onChange) {
        onChange(strValue)
      }
    }
  })
)

const convertToDate = (strValue: string): moment.Moment | undefined => {
  const value = moment(strValue, 'L')
  if (value.isValid()) {
    return value
  }
}

export const DatePicker = enhance((props) => {
  const {onChange, startDate, onInputChange} = props
  return <RDatePicker
    {...props}
    selected={startDate}
    onChange={onChange}
    customInput={<FormControl type='input' onChange={onInputChange}/>}
  />
})
