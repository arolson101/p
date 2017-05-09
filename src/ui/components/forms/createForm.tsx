import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import * as Select from 'react-select'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, mapPropsStream } from 'recompose'
import { reduxForm, Field, FieldProps, InjectedFieldProps, formValueSelector, change, ErrorsFor, SubmissionError } from 'redux-form'
import * as Rx from 'rxjs/Rx'
import { getFavicon$ } from '../../../actions/index'
import { mapDispatchToProps } from '../../../state/index'
import { IconPicker } from './IconPicker'

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

type DontCare = { [key: string]: any }

type WrapperProps = InjectedFieldProps<string> & FormField<any> & LayoutProps & React.Props<any>
const Wrapper = (props: WrapperProps & DontCare) => {
  const { input: { name }, meta: { warning, error }, label, help, layout, children } = props
  return (
    <RB.FormGroup
      controlId={name}
      validationState={error ? 'error' : warning ? 'warning' : undefined}
    >
      <RB.Col componentClass={RB.ControlLabel} {...layout.label}>
        {label &&
          <FormattedMessage {...label}/>
        }
      </RB.Col>
      <RB.Col {...layout.control}>
        {children}
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

// input ----------------------------------------------------------------------
interface InputFormField<V> extends FormField<V> {
  type: 'text' | 'password'
  rows?: number
  password?: boolean
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}

const renderInput = (props: InputFormField<any> & WrapperProps) => {
  const { input, meta, label, help, layout, rows, password, addonBefore, addonAfter, initialValue, ...passedProps } = props
  const formControl = (
    <RB.FormControl
      componentClass={rows ? 'textarea' : undefined}
      type={password ? 'password' : undefined}
      rows={rows}
      {...passedProps}
      {...input}
    />
  )

  return (
    <Wrapper {...props}>
      {(addonBefore || addonAfter) ? (
        <RB.InputGroup>
          {addonBefore}
          {formControl}
          {addonAfter}
        </RB.InputGroup>
      ) : (
        formControl
      )}
    </Wrapper>
  )
}

// url ------------------------------------------------------------------------
interface UrlFormField<V> extends FormField<V> {
  type: 'url'
  favicoName: keyof V
}

type RenderUrlProps = UrlFormField<any> & WrapperProps & {
  change: typeof change
}

const enhanceUrl = compose(
  connect(
    undefined,
    mapDispatchToProps({ change })
  ),
  mapPropsStream(
    (props$: Rx.Observable<RenderUrlProps>) => {
      const changeIcon$ = props$
        .pluck<RenderUrlProps, string>('input', 'value')
        .distinctUntilChanged()
        .debounceTime(500)
        // .do((url) => console.log(`getting favicon for ${url}`))
        .switchMap(getFavicon$)
        .withLatestFrom(props$, (icon, props) => {
          props.change(props.meta.form, props.favicoName, icon!)
        })

      return props$.merge(changeIcon$.ignoreElements())
    }
  ),
)

const renderUrl = enhanceUrl((props: RenderUrlProps) => {
  const { favicoName, type, change, ...inputProps } = props
  return renderInput(inputProps as any)
})

const renderFavico = (props: InjectedFieldProps<any>) => {
  const { input: { value, onChange } } = props
  return <RB.InputGroup.Button>
    <IconPicker value={value} onChange={onChange} />
  </RB.InputGroup.Button>
}

// select ---------------------------------------------------------------------
export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
}

type SelectFormField<V> = FormField<V> & Select.ReactSelectProps & {
  type: 'select'
  createable?: boolean
  parse?: (value: any) => any
  format?: (value: any) => string
  options: SelectOption[]
}

const noop = () => undefined

const renderSelect = (props: SelectFormField<any> & WrapperProps) => {
  const { input, meta: { warning, error }, createable, label, layout, ...passedProps } = props
  const Component = createable ? Select.Creatable : Select
  return (
    <Wrapper {...props}>
      <Component
        {...passedProps as any}
        {...input}
        menuContainerStyle={{ zIndex: 5 }} // https://github.com/JedWatson/react-select/issues/1076
        onBlur={noop} // https://github.com/erikras/redux-form/issues/1185
      />
    </Wrapper>
  )
}

// date -----------------------------------------------------------------------

// interface DateFormField<V> extends FormField<V> {
//   type: 'date'
// }

// checkbox -------------------------------------------------------------------
interface CheckboxFormField<V> extends FormField<V> {
  type: 'checkbox'
  message: FormattedMessage.MessageDescriptor
}

const renderCheckbox = (props: CheckboxFormField<any> & WrapperProps) => {
  const { input, meta: { warning, error }, label, message, layout, ...passedProps } = props
  return (
    <Wrapper {...props}>
        <RB.Checkbox {...input} checked={input.value}>
          <FormattedMessage {...message}/>
        </RB.Checkbox>
    </Wrapper>
  )
}

// interface AccountFormField<V> extends FormField<V> {
//   type: 'account'
// }

// interface BudgetFormField<V> extends FormField<V> {
//   type: 'budget'
// }

type FormFieldType<V> = InputFormField<V>
  | SelectFormField<V>
  | UrlFormField<V>
  // | DateFormField<V>
  | CheckboxFormField<V>
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
          const valueOf = (value?: SelectOption): string => {
            if (!value) {
              return ''
            }
            return (value as any)[field.valueKey || 'value']
          }

          field.parse = (value: any) => {
            if (value && field.multi) {
              return (value as SelectOption[])
                .sort((a, b) => field.options.indexOf(a) - field.options.indexOf(b))
                .map(valueOf)
                .join(field.delimiter || ',')
            } else {
              return valueOf(value)
            }
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

        switch (field.type) {
          case 'text':
            return <Field {...baseProps} component={renderInput} {...fieldProps as any}/>
          case 'password':
            return <Field {...baseProps} component={renderInput} {...fieldProps as any} password/>
          case 'url':
            return (
              <Field {...baseProps} component={renderUrl} {...fieldProps as any}
                addonBefore={
                  <Field
                    component={renderFavico}
                    name={field.favicoName}
                  />
                }
              />
            )
          case 'select':
            return <Field {...baseProps} component={renderSelect} {...fieldProps as any}/>
          case 'checkbox':
            return <Field {...baseProps} component={renderCheckbox} {...fieldProps as any}/>

          default:
            throw new Error(`unknown form field type ${type}`)
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
  url: {
    id: 'forms.url',
    defaultMessage: 'url'
  },
  multiline: {
    id: 'forms.multiline',
    defaultMessage: 'multiline'
  },
  select: {
    id: 'forms.select',
    defaultMessage: 'select'
  },
  checkbox: {
    id: 'forms.checkbox',
    defaultMessage: 'checkbox'
  },
  checkboxmessage: {
    id: 'forms.checkboxmessage',
    defaultMessage: 'checkbox message'
  },
})

interface Values {
  text: string
  password: string
  multiline: string
  select: string
  select2: string
  url: string
  favicon: string
  checkbox: boolean
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
    { name: 'url',
      favicoName: 'favicon',
      label: testMessages.url,
      type: 'url'
    },
    { name: 'multiline',
      label: testMessages.multiline,
      type: 'text',
      rows: 4
    },
    { name: 'checkbox',
      label: testMessages.checkbox,
      message: testMessages.checkboxmessage,
      type: 'checkbox'
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
