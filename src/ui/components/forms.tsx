import * as React from 'react'
import { Field, FieldProp } from 'redux-form'
import * as RFMUI from 'redux-form-material-ui'
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

const FieldTemplate = <Values, T>(component: React.ComponentClass<T>) =>
  (props: T & React.HTMLAttributes<any> & FieldProp<keyof Values>) => (
    <Field component={component} {...props} />
  )

export const formFields = function<Values> () {
  return ({
    AutoComplete: FieldTemplate<Values, __MaterialUI.AutoCompleteProps>(RFMUI.AutoComplete),
    Checkbox: FieldTemplate<Values, __MaterialUI.Switches.CheckboxProps>(RFMUI.Checkbox),
    TimePicker: FieldTemplate<Values, __MaterialUI.TimePickerProps>(RFMUI.TimePicker),
    DatePicker: FieldTemplate<Values, __MaterialUI.DatePicker.DatePickerProps>(RFMUI.DatePicker),
    RadioButtonGroup: FieldTemplate<Values, __MaterialUI.Switches.RadioButtonGroupProps>(RFMUI.RadioButtonGroup),
    SelectField: FieldTemplate<Values, __MaterialUI.SelectFieldProps>(RFMUI.SelectField),
    Slider: FieldTemplate<Values, __MaterialUI.SliderProps>(RFMUI.Slider),
    TextField: FieldTemplate<Values, __MaterialUI.TextFieldProps>(RFMUI.TextField),
    Toggle: FieldTemplate<Values, __MaterialUI.Switches.ToggleProps>(RFMUI.Toggle)
  })
}
