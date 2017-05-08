import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as Select from 'react-select'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import { reduxForm, Field, FieldProps, InjectedFieldProps, change, ErrorsFor, SubmissionError } from 'redux-form'

const messages = defineMessages({
  save: {
    id: 'createForm.save',
    defaultMessage: 'save'
  },
})

interface FormField<V> {
  name: keyof V
  label: FormattedMessage.MessageDescriptor
  help?: FormattedMessage.MessageDescriptor
  initialValue?: any
  required?: boolean
  autoFocus?: boolean
}

interface LayoutProps {
  layout: {
    control: RB.ColProps
    label: RB.ColProps
    nolabel: RB.ColProps
  }
}

interface TextFormField<V> extends FormField<V> {
  type: 'text' | 'password'
  rows?: number
  password?: boolean
}

type DontCare = { [key: string]: any }

type WrapperProps = InjectedFieldProps<string> & FormField<any> & LayoutProps & React.Props<any>
const Wrapper = (props: WrapperProps & DontCare) => {
  const { input: { name }, meta: { warning, error }, label, help, layout } = props
  return (
    <RB.FormGroup
      controlId={name}
      validationState={error ? 'error' : warning ? 'warning' : undefined}
    >
      <RB.Col componentClass={RB.ControlLabel} {...layout.label}>
        {props.label &&
          <FormattedMessage {...props.label}/>
        }
      </RB.Col>
      <RB.Col {...layout.control}>
        {props.children}
        {/*<RB.FormControl.Feedback/>*/}
        {help &&
          <RB.HelpBlock><FormattedMessage {...help}/></RB.HelpBlock>
        }
        {(error || warning) &&
          <RB.HelpBlock >{error || warning}</RB.HelpBlock>
        }
      </RB.Col>
    </RB.FormGroup>
  )
}

const renderInput = (props: TextFormField<any> & WrapperProps) => {
  const { input, meta, label, help, layout, rows, password, ...passedProps } = props
  return (
    <Wrapper {...props}>
      <RB.FormControl
        componentClass={rows ? 'textarea' : undefined}
        type={password ? 'password' : undefined}
        {...passedProps as any}
        {...props.input}
      />
    </Wrapper>
  )
}

export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
  options: SelectOption[]
}

type SelectFormField<V> = FormField<V> & Select.ReactSelectProps & {
  type: 'select'
  createable?: boolean
  parse?: (value: any) => any
  format?: (value: any) => string
}

const noop = () => undefined

const renderSelect = (props: SelectFormField<any> & WrapperProps) => {
  const { input, meta: { warning, error }, createable, label, layout, ...passedProps } = props
  let value = props.value
  if (props.value && props.multi && props.delimiter) {
    value = (props.value as string).split(props.delimiter)
  }
  const Component = createable ? Select.Creatable : Select

  return (
    <Wrapper {...props}>
      <Component
        value={value}
        {...passedProps as any}
        {...input}
        menuContainerStyle={{ zIndex: 5 }} // https://github.com/JedWatson/react-select/issues/1076
        onBlur={noop} // https://github.com/erikras/redux-form/issues/1185
      />
    </Wrapper>
  )
}

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
  | SelectFormField<V>
  // | DateFormField<V>
  // | CheckboxFormField<V>
  // | AccountFormField<V>
  // | BudgetFormField<V>

export interface FormConfig<V> {
  formName: string
  fields: FormFieldType<V>[]
  onSubmit: (values: V, error: (errors: ErrorsFor<V>) => void) => void | Promise<any>
  onChange?: (values: V, change: (field: string, value: any) => void) => void
}

const formComponent = <V extends {}>(config: FormConfig<V>) => {
  const onSubmit = (values: V) => {
    return config.onSubmit(values, errors => {
      throw new SubmissionError(errors)
    })
  }

  const onChange = (values: V, dispatch: any) => {
    if (config.onChange) {
      const changeField = (field: string, value: any) => {
        dispatch(change(config.formName, field, value))
      }
      config.onChange(values, changeField)
    }
  }

  const layoutProps: LayoutProps = {
    layout: {
      label: { sm: 2 },
      control: { sm: 10 },
      nolabel: { smOffset: 2, sm: 10 }
    }
  }

  config.fields.forEach(field => {
    switch (field.type) {
      case 'select':
        if (!field.parse) {
          const valueKey = field.valueKey
          field.parse = (value: any) => {
            if (value && field.multi && field.delimiter) {
              value = (value as string).split(field.delimiter)
            }
            const ret = value ? (valueKey ? value[valueKey] : value['value']) : value
            console.log(`parse: `, value, ' => ', ret)
            return ret
          }
        }
        break
    }
  })

  const enhance = compose(
    reduxForm({
      form: config.formName,
      onSubmit,
      onChange
    })
  )
  return enhance((props: any) => {
    const { handleSubmit } = props
    return <RB.Form horizontal onSubmit={handleSubmit}>
      {config.fields.map(field => {
        const { name, type, required, autoFocus, initialValue, ...fieldProps } = field
        const baseProps = {
          key: name,
          name,
          ...layoutProps
        }

        switch (type) {
          case 'text':
            return <Field {...baseProps} component={renderInput} {...fieldProps as any}/>
          case 'password':
            return <Field {...baseProps} component={renderInput} {...fieldProps as any} password/>
          case 'select':
            return <Field {...baseProps} component={renderSelect} {...fieldProps as any}/>

          // case 'select':
          //   fieldProps.component = renderSelect
          //   break
        }
      })}
      <RB.FormGroup>
        <RB.Col {...layoutProps.layout.nolabel}>
          <RB.Button type='submit'>_submit_</RB.Button>
        </RB.Col>
      </RB.FormGroup>
    </RB.Form>
  })
}

const testMessages = defineMessages({
  text: {
    id: 'forms.text',
    defaultMessage: 'text'
  },
  password: {
    id: 'forms.password',
    defaultMessage: 'password'
  },
  multiline: {
    id: 'forms.multiline',
    defaultMessage: 'multiline'
  },
  select: {
    id: 'forms.select',
    defaultMessage: 'select'
  },
})

interface Values {
  text: string
  password: string
  multiline: string
  select: string
  select2: string
}

export const Test = formComponent<Values>({
  formName: 'test',
  fields: [
    { name: 'text',
      label: testMessages.text,
      help: testMessages.text,
      type: 'text'
    },
    { name: 'password',
      label: testMessages.password,
      type: 'password'
    },
    { name: 'multiline',
      label: testMessages.multiline,
      type: 'text',
      rows: 4
    },
    { name: 'select',
      label: testMessages.select,
      type: 'select',
      options: [
        { label: 'option 1', value: 'value 1' },
        { label: 'option 2', value: 'value 2' },
        { label: 'option 3', value: 'value 3' },
      ]
    },
    { name: 'select2',
      label: testMessages.select,
      type: 'select',
      multi: true,
      options: [
        { label: 'option 1', value: 'value 1' },
        { label: 'option 2', value: 'value 2' },
        { label: 'option 3', value: 'value 3' },
      ]
    },
  ],
  onSubmit: (values, error) => {
    error({
      text: 'text error',
      password: 'password error',
      multiline: 'multiline error'
    })
  },
  onChange: (values, change) => {
    change('password', values.text || '')
  }
})

const renderTest = () => {
  return <RB.Grid><Test /></RB.Grid>
}
