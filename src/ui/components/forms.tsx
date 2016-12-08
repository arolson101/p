import * as React from 'react'
import { Field, FieldProps, FieldComponent, InjectedFieldProps } from 'redux-form'
import * as RB from 'react-bootstrap'
import { defineMessages } from 'react-intl'

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
  }
})

// const FieldTemplate = <Values, T>(component: React.ComponentClass<T>, componentProps: T) =>
//   (props: T & React.HTMLAttributes<any> & InjectedFieldProps<keyof Values>) => (
//     <Field {...componentProps} component={component} {...props} />
//   )

// export const formFields = function<Values> () {
//   return ({

//     AutoComplete: FieldTemplate<Values, __MaterialUI.AutoCompleteProps>(RFMUI.AutoComplete),
//     Checkbox: FieldTemplate<Values, __MaterialUI.Switches.CheckboxProps>(RFMUI.Checkbox),
//     TimePicker: FieldTemplate<Values, __MaterialUI.TimePickerProps>(RFMUI.TimePicker),
//     DatePicker: FieldTemplate<Values, __MaterialUI.DatePicker.DatePickerProps>(RFMUI.DatePicker),
//     RadioButtonGroup: FieldTemplate<Values, __MaterialUI.Switches.RadioButtonGroupProps>(RFMUI.RadioButtonGroup),
//     SelectField: FieldTemplate<Values, __MaterialUI.SelectFieldProps>(RFMUI.SelectField),
//     Slider: FieldTemplate<Values, __MaterialUI.SliderProps>(RFMUI.Slider),
//     TextField: FieldTemplate<Values, __MaterialUI.TextFieldProps>(RFMUI.TextField),
//     Toggle: FieldTemplate<Values, __MaterialUI.Switches.ToggleProps>(RFMUI.Toggle)
//   })
// }

interface FieldGroupProps<Name> {
  name: Name
  label: string
}

const FormControl = <Name extends string>(props: FieldGroupProps<Name> & InjectedFieldProps<string> & RB.FormControlProps) => {
  const { input, meta, ...fieldProps } = props as any
  const { name, label } = fieldProps
  const { error, warning } = meta
  return (
    <RB.FormGroup controlId={name} {...{validationState: error ? 'error' : warning ? 'warning' : undefined}}>
      <RB.ControlLabel>{label}</RB.ControlLabel>
      <RB.FormControl {...fieldProps} {...input} />
      {(error || warning) && <RB.HelpBlock>{error || warning}</RB.HelpBlock>}
    </RB.FormGroup>
  )
}

// export const FieldGroup = <Name extends string, foo>(props: FieldGroupProps<Name>) => (
//   <Field {...props} component={FormControl} />
// )

// export const TextField = <Name extends string>() =>
//   (props: FieldGroupProps<Name>) => (
//     <Field {...props} component={FormControl} type='text' />
//   )

const FieldTemplate = <Values, Props>(component: FieldComponent<Props>, componentProps: Props) =>
  (props: Props & React.HTMLAttributes<any> & Partial<FieldProps<Values, Props>>) => (
    <Field {...componentProps} component={component} {...props} />
  )

export const formFields = function<Values> () {
  return ({
    TextField: FieldTemplate<Values, RB.FormControlProps>(FormControl, {type: 'input'}),
    PasswordField: FieldTemplate<Values, RB.FormControlProps>(FormControl, {type: 'password'})
  })
}
