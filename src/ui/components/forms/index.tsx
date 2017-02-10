import * as React from 'react'
import { Field, FieldProps, FieldComponent, InjectedFieldProps } from 'redux-form'
import * as RB from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import * as Select from 'react-select'
import { AccountPicker } from './AccountPicker'
import { ColorPicker, ColorPickerProps } from './ColorPicker'
import { DatePicker, DatePickerProps } from './DatePicker'
import { IconPicker, IconPickerProps } from './IconPicker'

import './forms.css'

export const forms = defineMessages({
  password: {
    id: 'forms.password',
    defaultMessage: 'Password'
  },
  confirmPassword: {
    id: 'forms.confirmPassword',
    defaultMessage: 'Confirm Password'
  },
  cancel: {
    id: 'forms.cancel',
    defaultMessage: 'Cancel'
  },
  create: {
    id: 'forms.create',
    defaultMessage: 'Create'
  },
  save: {
    id: 'forms.save',
    defaultMessage: 'Save'
  },
  delete: {
    id: 'forms.delete',
    defaultMessage: 'Delete'
  },
  login: {
    id: 'forms.login',
    defaultMessage: 'Login'
  },
  required: {
    id: 'forms.required',
    defaultMessage: 'Required'
  },
  passwordsMatch: {
    id: 'forms.passwordsMatch',
    defaultMessage: 'Passwords must match'
  },
  date: {
    id: 'forms.date',
    defaultMessage: 'Invalid date'
  },
  number: {
    id: 'forms.number',
    defaultMessage: 'Invalid number'
  },
})

interface FieldGroupProps<Name> {
  name: Name
  label?: string
  help?: string
  minimal?: boolean
  onChange?: (newValue: any) => any
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}

const WrappedControl = <Name extends string, Props>(Component: any, componentProps?: Props) =>
  (props: FieldGroupProps<Name> & Partial<InjectedFieldProps<string>> & Props) => {
    const { minimal, addonBefore, addonAfter, input, meta, help, ...fieldProps } = props as any
    const { name, label } = fieldProps
    const { error, warning } = meta
    const onChange = (e: any) => {
      if (input.onChange) { input.onChange(e) }
      if (props.onChange) { props.onChange(e) }
    }
    let component = <Component {...componentProps} {...fieldProps} {...input} onChange={onChange}/>
    if (addonBefore || addonAfter) {
      component = (
        <RB.InputGroup>
          {addonBefore}
          {component}
          {addonAfter}
        </RB.InputGroup>
      )
    }
    return (
      <RB.FormGroup controlId={name} {...{validationState: error ? 'error' : warning ? 'warning' : undefined}}>
        {!minimal &&
          <RB.ControlLabel className={minimal ? '' : 'col-xs-2'}>{label}</RB.ControlLabel>
        }
        {' '}
        <div className={minimal ? 'col-xs-12' : 'col-xs-10'}>
          <RB.FormControl.Feedback />
          {component}
        </div>
        {(error || warning || help) &&
          <RB.HelpBlock className={minimal ? 'col-xs-12' : 'col-xs-10 col-xs-offset-2'}>{error || warning || help}</RB.HelpBlock>
        }
      </RB.FormGroup>
    )
  }

// react-select with onChange/onBlur compatable with redux-form
const RFCompatibleSelect = (Component: React.ComponentClass<Select.ReactSelectProps>) => (props: Select.ReactSelectProps) => {
  let value = props.value
  if (props.value && props.multi && props.delimiter) {
    value = (props.value as string).split(props.delimiter)
  }
  return <Component
    {...props}
    menuContainerStyle={{ zIndex: 5 }} // https://github.com/JedWatson/react-select/issues/1076
    value={value}
    onChange={(e: any) => {
      const newValue = e && (props.valueKey ? e[props.valueKey] : props.multi ? e : e.value)
      if (props.onChange) {
        props.onChange(newValue)
      }
    }}
    onBlur={() => props.onBlur && props.onBlur(props.value ? props.value : undefined as any)}
  />
}

export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
}

const RBCheckbox = (props: RB.CheckboxProps & InjectedFieldProps<any>) =>
  <RB.Checkbox
    {...props.input}
    checked={props.input.value}
  >
    {props.label}
  </RB.Checkbox>

const FieldTemplate = <Values, Props>(component: FieldComponent<Props>) =>
  (props: Props & FieldGroupProps<keyof Values> & Partial<FieldProps<Values, Props>>) => (
    <Field component={component} {...props as any} />
  )

export const TextControl = WrappedControl(RB.FormControl, {type: 'input'})
export const MultilineTextControl = WrappedControl(RB.FormControl, {componentClass: 'textarea'})
export const PasswordControl = WrappedControl(RB.FormControl, {type: 'password'})
export const SelectControl = WrappedControl<string, Select.ReactSelectProps>(RFCompatibleSelect(Select))
export const SelectCreateableControl = WrappedControl<string, Select.ReactCreatableSelectProps>(RFCompatibleSelect(Select.Creatable))
export const AccountControl = WrappedControl<string, Select.ReactSelectProps>(RFCompatibleSelect(AccountPicker))
export const DateControl = WrappedControl<string, DatePickerProps>(DatePicker)
export const ColorControl = WrappedControl<string, ColorPickerProps>(ColorPicker)
export const IconControl = WrappedControl<string, IconPickerProps>(IconPicker)

export const typedFields = function<Values> () {
  return ({
    TextField: FieldTemplate<Values, RB.FormControlProps>(TextControl),
    MultilineTextField: FieldTemplate<Values, RB.FormControlProps>(MultilineTextControl),
    PasswordField: FieldTemplate<Values, RB.FormControlProps>(PasswordControl),
    SelectField: FieldTemplate<Values, Select.ReactSelectProps>(SelectControl),
    SelectCreateableField: FieldTemplate<Values, Select.ReactCreatableSelectProps>(SelectCreateableControl),
    AccountField: FieldTemplate<Values, Select.ReactSelectProps>(AccountControl),
    CheckboxField: FieldTemplate<Values, RB.CheckboxProps>(RBCheckbox),
    DateField: FieldTemplate<Values, DatePickerProps>(DateControl),
    ColorField: FieldTemplate<Values, ColorPickerProps>(ColorControl),
    IconField: FieldTemplate<Values, IconPickerProps>(IconControl),
  })
}
