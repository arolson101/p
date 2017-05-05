import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { Field, FieldProps, InjectedFieldProps } from 'redux-form'

interface FormField<V> {
  name: keyof V
  label: string // FormattedMessage.MessageDescriptor
  initialValue?: any
  required?: boolean
  autoFocus?: boolean
}

interface TextFormField<V> extends FormField<V> {
  type: 'text'
}

import { typedFields } from '../index'

interface InputProps {
  type: string
}

const renderInput = (props: InjectedFieldProps<string> & InputProps) => {
  return (
    <div>
      <input {...props.input} type={props.type}/>
    </div>
  )
}

// export interface SelectOption {
//   value: any
//   label: string
//   disabled?: boolean
// }

// interface SelectFormField<V> extends FormField<V> {
//   type: 'select'
//   createable?: boolean
// }

// interface DateFormField<V> extends FormField<V> {
//   type: 'date'
// }

// interface CheckboxFormField<V> extends FormField<V> {
//   type: 'checkbox'
// }

// interface AccountFormField<V> extends FormField<V> {
//   type: 'account'
// }

// interface BudgetFormField<V> extends FormField<V> {
//   type: 'budget'
// }

// interface UrlFormField<V> extends FormField<V> {
//   type: 'url'
//   faviconName: keyof V
// }

type FormFieldType<V> = TextFormField<V>
  // | SelectFormField<V>
  // | DateFormField<V>
  // | CheckboxFormField<V>
  // | AccountFormField<V>
  // | BudgetFormField<V>

export interface FormConfig<V> {
  formName: string
  fields: FormFieldType<V>[]
}

interface Props<V> {
  config: FormConfig<V>
}

export const forms = defineMessages({
  password: {
    id: 'forms.password',
    defaultMessage: 'Password'
  },
})

interface Values {
  foo: string
}

const formComponent = <V extends {}>(config: FormConfig<V>) => {
  const F = typedFields<V>()

  // const enhance =
  return (props: any) => {
    return <div>
      {config.fields.map(field => {
        const { name, type, required, autoFocus, initialValue, ...fieldProps } = field

        switch (type) {
          case 'text':
            return <F.TextField name={name} {...fieldProps}/>

          // case 'select':
          //   fieldProps.component = renderSelect
          //   break
        }
      })}
    </div>
  }
}

const Test = formComponent<Values>({
  formName: 'test',
  fields: [
    {
      name: 'foo',
      label: '', // forms.password,
      type: 'text'
    }
  ]
})

const renderTest = () => {
  return <Test />
}
