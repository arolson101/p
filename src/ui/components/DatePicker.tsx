import * as moment from 'moment'
import * as React from 'react'
import { FormControl } from 'react-bootstrap'
import * as DateRangePicker from 'react-bootstrap-daterangepicker'
import 'react-bootstrap-daterangepicker/css/daterangepicker.css'
import { connect } from 'react-redux'
import { compose, withHandlers, withState } from 'recompose'
import { AppState } from '../../state'

interface Props {
  value: Date | ''
}

type AllProps = Props & ConnectedProps & EnhancedProps

interface ConnectedProps {
  locale: string
}

interface EnhancedProps {
  stringValue: string
  setStringValue: (stringValue: string) => void
  onApply: (event: any, picker: DatepickerOptions) => void
  onValueChange: (event: any) => void
}

const enhance = compose<AllProps, Props>(
  withState('stringValue', 'setStringValue', ''),
  withHandlers({
    onApply: (props: any) => (event: any, picker: DatepickerOptions) => {
      const value: moment.Moment = picker.startDate
      props.onChange(value.toDate())
      props.setStringValue(value.format('L'))
    },
    onValueChange: (props: any) => (e: React.FormEvent<any>) => {
      const strValue = (e.target as any).value
      const value = moment(strValue, 'L')
      if (value.isValid) {
        props.onChange(value.toDate())
      } else {
        props.onChange(null)
      }
      props.setStringValue(strValue)
    }
  }),
  connect(
    (state: AppState): ConnectedProps => ({
      locale: state.i18n.locale
    })
  )
)

export const DatePicker = enhance(({onApply, stringValue, locale, onValueChange}) => {
  return <DateRangePicker singleDatePicker={true} onApply={onApply} locale={locale}>
    <FormControl type='input' value={stringValue} onChange={onValueChange}/>
  </DateRangePicker>
})
