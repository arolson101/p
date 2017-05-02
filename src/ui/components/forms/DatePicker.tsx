const autobind = require('autobind-decorator')
import * as moment from 'moment'
import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { FormControl, FormControlProps } from 'react-bootstrap'
import RDatePicker /*, { ReactDatePickerProps }*/ from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { checkPropChange } from '../../enhancers/index'

import './DatePicker.css'

interface Props {
  value?: string
  onChange?: (value: string) => void
}

export type DatePickerProps = Partial<any /*ReactDatePickerProps*/> & Props

interface State {
  startDate?: moment.Moment
}

export class DatePicker extends React.Component<Props, State> {
  static propTypes: PropTypes<Props> = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  state: State = {
    startDate: undefined
  }

  componentDidMount () {
    checkPropChange(undefined, this.props, 'value', this.onValueChange)
  }

  componentWillReceiveProps (nextProps: any) {
    checkPropChange(this.props, nextProps, 'value', this.onValueChange)
  }

  render () {
    return <RDatePicker
      {...this.props as any}
      selected={this.state.startDate}
      onChange={this.onChange}
      customInput={
        <FocusableFormControl type='input' onChange={this.onInputChange}/>
      }
    />
  }

  @autobind
  onValueChange (value: string | undefined) {
    const startDate = (value ? convertToDate(value) : undefined)
    this.setState({startDate})
  }

  @autobind
  onChange (value?: any) {
    const { onChange } = this.props
    if (onChange) {
      onChange(moment(value).format('L'))
    }
  }

  @autobind
  onInputChange (e: React.FormEvent<any>) {
    const {onChange} = this.props
    const strValue = (e.target as any).value
    const startDate = convertToDate(strValue)
    if (startDate) {
      this.setState({startDate})
    }
    if (onChange) {
      onChange(strValue)
    }
  }
}

class FocusableFormControl extends React.Component<FormControlProps, any> {
  control: any

  focus () {
    ReactDOM.findDOMNode<HTMLInputElement>(this.control).focus()
  }

  @autobind
  setControl (control: any) {
    this.control = control
  }

  render () {
    return <FormControl ref={this.setControl} {...this.props}/>
  }
}

const convertToDate = (strValue: string): moment.Moment | undefined => {
  const value = moment(strValue, 'L')
  if (value.isValid()) {
    return value
  }
}
