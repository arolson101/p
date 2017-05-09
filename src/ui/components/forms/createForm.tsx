import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import * as Select from 'react-select'
import { compose, mapPropsStream } from 'recompose'
import { reduxForm, ReduxFormProps, Field, InjectedFieldProps,
  formValueSelector, change, ErrorsFor, SubmissionError } from 'redux-form'
import { createSelector } from 'reselect'
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

export type GetField<V> = (...field: (keyof V)[]) => any

interface FormField<V> {
  name: keyof V
  label: FormattedMessage.MessageDescriptor
  help?: FormattedMessage.MessageDescriptor
  initialValue?: any
  required?: boolean
  autoFocus?: boolean
  visibility?: (getField: GetField<V>) => boolean
}

interface LayoutProps {
  layout: {
    control: RB.ColProps
    label: RB.ColProps
    nolabel: RB.ColProps
  }
}

type DontCareWhatElse = { [key: string]: any }

type WrapperProps = InjectedFieldProps<string> & FormField<any> & LayoutProps & React.Props<any>
const Wrapper = (props: WrapperProps & DontCareWhatElse) => {
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
  const { input, meta, label, help, layout, rows,
    password, visibility, addonBefore, addonAfter, initialValue, ...passedProps } = props
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
  placeholderMessage?: FormattedMessage.MessageDescriptor
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

// ----------------------------------------------------------------------------
// formComponent --------------------------------------------------------------

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
  onChange?: (values: V, change: ChangeField) => void
}

interface Props<V> {
  edit?: V
  onSave: (values: V, error: ErrorCallback<V>, dispatch: any, props: any) => void | Promise<any>
  onCancel: React.MouseEventHandler<{}>
}

export type ErrorCallback<V> = (errors: ErrorsFor<V>) => void
export type ChangeField = (field: string, value: any) => void

export const formComponent = <V extends {}>(config: FormConfig<V>) => {
  const onSubmit = (values: V, dispatch: any, props: Props<V>) => {
    return props.onSave(
      values,
      errors => {
        throw new SubmissionError(errors)
      },
      dispatch,
      props
    )
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

  const defaultInitialValues = {} as V

  config.fields.forEach(field => {
    if (field.initialValue) {
      defaultInitialValues[field.name] = field.initialValue
    }

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

  const selectInitialValues = createSelector(
    (props: Props<V>) => props.edit,
    (edit: V | undefined) => {
      return edit || defaultInitialValues
    }
  )

  const selector = formValueSelector<V>(config.formName)

  const enhance = compose<ReduxFormProps<V> & Props<V> & InjectedIntlProps & { visible: boolean[] }, Props<V>>(
    connect(
      (state, props: Props<V>) => {
        const valueSelector = (...field: (keyof V)[]) => selector(state, ...field)
        return {
          visible: config.fields.map(field => field.visibility ? field.visibility(valueSelector) : true),
          initialValues: selectInitialValues(props)
        }
      }
    ),
    reduxForm({
      form: config.formName,
      onSubmit,
      onChange,
      overwriteOnInitialValuesChange: true
    }),
    injectIntl,
  )
  return enhance((props) => {
    const { handleSubmit, intl: { formatMessage } } = props
    return <RB.Grid>
      <RB.Form horizontal onSubmit={handleSubmit}>
        {config.fields.map((field, index) => {
          const { name, type, required, autoFocus, initialValue, ...fieldProps } = field
          const baseProps = {
            name,
            key: field.name,
            ...layoutProps
          }

          let component
          switch (field.type) {
            case 'text':
              component = <Field {...baseProps} component={renderInput} {...fieldProps as any}/>
              break
            case 'password':
              component = <Field {...baseProps} component={renderInput} {...fieldProps as any} password/>
              break
            case 'url':
              component = (
                <Field {...baseProps} component={renderUrl} {...fieldProps as any}
                  addonBefore={
                    <Field
                      component={renderFavico}
                      name={field.favicoName}
                    />
                  }
                />
              )
              break
            case 'select':
              if (field.placeholderMessage) {
                // hack: convert to a string here so components don't have to worry about intl
                (fieldProps as any).placeholder = formatMessage(field.placeholderMessage as FormattedMessage.MessageDescriptor)
              }
              component = <Field {...baseProps} component={renderSelect} {...fieldProps as any}/>
              break
            case 'checkbox':
              component = <Field {...baseProps} component={renderCheckbox} {...fieldProps as any}/>
              break
            default:
              component = <div>{`unknown form field type ${type}`}</div>
              break
          }

          return field.visibility ?
            (
              <RB.Collapse in={props.visible[index]} key={field.name}>
                <div>{component}</div>
              </RB.Collapse>
            ) : (
              component
            )
        })}
        <RB.FormGroup>
          <RB.Col {...layoutProps.layout.nolabel}>
            <RB.ButtonGroup>
              <RB.Button type='submit' bsStyle='primary'>_save_</RB.Button>
              {' '}
              <RB.Button onClick={props.onCancel}>_cancel_</RB.Button>
            </RB.ButtonGroup>
          </RB.Col>
        </RB.FormGroup>
      </RB.Form>
    </RB.Grid>
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
  selectPlaceholder: {
    id: 'forms.selectPlaceholder',
    defaultMessage: 'select placeholder'
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

const isChecked = (getField: GetField<Values>) => getField('checkbox')

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
      type: 'password',
      visibility: isChecked
    },
    { name: 'url',
      favicoName: 'favicon',
      label: testMessages.url,
      type: 'url',
      visibility: isChecked
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
      placeholderMessage: testMessages.selectPlaceholder,
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
  onChange: (values, change) => {
    change('password', values.text || '')
  }
})

export const RenderTest = () => {
  return <Test
    edit={{
      text: 'text',
      password: 'password',
      multiline: 'multiline',
      select: 'value 2',
      select2: 'value 1,value 3',
      url: 'http://www.google.com',
      favicon: '',
      checkbox: true,
    }}
    onSave={(values, error) => {
      error({
        text: 'text error',
        password: 'password error',
        multiline: 'multiline error'
      })
    }}
    onCancel={() => {
      console.log('cancel')
    }}
  />
}
