import * as moment from 'moment'
import * as React from 'react'
import { FormControl } from 'react-bootstrap'
import * as DateRangePicker from 'react-bootstrap-daterangepicker'
import 'react-bootstrap-daterangepicker/css/daterangepicker.css'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { compose, withHandlers, withState } from 'recompose'
import { AppState } from '../../state'

interface Props {
  value: string
}

type AllProps = Props & ConnectedProps & EnhancedProps

interface ConnectedProps {
  locale: ReactBootstrapDaterangepicker.Locale
}

interface EnhancedProps {
  startDate: Date
  setStartDate: (startDate: Date) => void
  onApply: (event: any, picker: DatepickerOptions) => void
  onInputChange: (event: any) => void
}

const enhance = compose<AllProps, Props>(
  withState('startDate', 'setStartDate', (props: Props) => convertToDate(props.value) || new Date()),
  withHandlers({
    onApply: (props: any) => (event: any, picker: DatepickerOptions) => {
      const value: moment.Moment = picker.startDate
      props.onChange(value.format('L'))
    },
    onInputChange: (props: any) => (e: React.FormEvent<any>) => {
      const strValue = (e.target as any).value
      const value = convertToDate(strValue)
      if (value) {
        props.setStartDate(value)
      }
      props.onChange(strValue)
    }
  }),
  connect(
    (state: AppState): ConnectedProps => ({
      locale: selectLocale(state)
    })
  )
)

const convertToDate = (strValue: string): Date | undefined => {
  const value = moment(strValue, 'L')
  if (value.isValid()) {
    return value.toDate()
  }
}

export const DatePicker = enhance(({onApply, startDate, value, locale, onInputChange}) => {
  return <DateRangePicker startDate={startDate} endDate={startDate} singleDatePicker={true} onApply={onApply} locale={locale}>
    <FormControl type='input' value={value} onChange={onInputChange}/>
  </DateRangePicker>
})

const selectLocale = createSelector(
  (state: AppState) => state.i18n.locale,
  (locale): ReactBootstrapDaterangepicker.Locale => {
    const localeData = moment.localeData(locale)
    return {
      format: localeData.longDateFormat('L'),
      separator: ' - ',
      applyLabel: 'apply',
      cancelLabel: 'cancel',
      fromLabel: 'from',
      toLabel: 'to',
      customRangeLabel: 'custom',
      weekLabel: 'w',
      daysOfWeek: localeData.weekdaysMin(),
      monthNames: localeData.months(),
      firstDay: localeData.firstDayOfWeek()
    }
  }
)
