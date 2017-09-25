import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import ReactSelect from 'react-select'
import 'react-select/dist/react-select.css'
import { compose, mapPropsStream, withContext } from 'recompose'
import * as RF from 'redux-form'
import { createSelector } from 'reselect'
import * as Rx from 'rxjs/Rx'
import * as RF2 from 'react-form'
import { getFaviconStream } from 'util/index'
import { mapDispatchToProps } from 'core/state'
import { AccountPicker } from './AccountPicker'
import { BudgetPicker } from './BudgetPicker'
import { ColorPicker } from './ColorPicker'
import { DatePicker, DatePickerProps } from './DatePicker'
import { IconPicker } from './IconPicker'
import { Favico } from './Favico'

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
})

export type GetField<V> = (...field: (keyof V)[]) => any

interface FormField<V> {
  name: keyof V
  label: FormattedMessage.MessageDescriptor
  help?: FormattedMessage.MessageDescriptor
}

interface FormField2 {
  name: string
  label: FormattedMessage.MessageDescriptor
  help?: FormattedMessage.MessageDescriptor
}

interface LayoutProps {
  layout: LayoutConfig
}

interface LayoutConfig {
  control: RB.ColProps
  label: RB.ColProps
  nolabel: RB.ColProps
}

type DontCareWhatElse = { [key: string]: any }

type WrapperProps = RF.WrappedFieldProps & FormField<any> & React.Props<any>
const Wrapper = (props: WrapperProps & DontCareWhatElse, { layout }: LayoutProps) => {
  const { input: { name }, meta: { warning, error }, label, help, children } = props
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
          <RB.HelpBlock>{error || warning}</RB.HelpBlock>
        }
      </RB.Col>
    </RB.FormGroup>
  )
}

(Wrapper as any).contextTypes = { layout: PropTypes.object }

type Wrapper2Props = FormField2 & React.Props<any>
const Wrapper2 = (props: Wrapper2Props & RF2.BoundFormAPI, { layout }: LayoutProps) => {
  const { label, help, children } = props
  const error = props.getError()
  return (
    <RB.FormGroup
      controlId={name}
      validationState={error ? 'error' : undefined}
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
        {(error) &&
          <RB.HelpBlock>{error}</RB.HelpBlock>
        }
      </RB.Col>
    </RB.FormGroup>
  )
}

(Wrapper2 as any).contextTypes = { layout: PropTypes.object }

// input ----------------------------------------------------------------------
interface InputFormField<V> extends FormField<V> /*, RB.FormControlProps*/ {
  autoFocus?: boolean
  rows?: number
  password?: boolean
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  type?: string
  min?: number
  max?: number
  disabled?: boolean
}

interface InputFormField2 extends FormField2 /*, RB.FormControlProps*/ {
  autoFocus?: boolean
  rows?: number
  password?: boolean
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  type?: string
  min?: number
  max?: number
  disabled?: boolean
}

const renderInput = (props: InputFormField<any> & WrapperProps) => {
  const { input, meta, label, help, rows,
    password, addonBefore, addonAfter, ...passedProps } = props
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

const renderInput2 = (props: TextField2Props & InputFormField<any> & Wrapper2Props) => (api: RF2.BoundFormAPI) => {
  const { label, help, rows,
    password, addonBefore, addonAfter, ...passedProps } = props
  const { setValue, getValue, setTouched } = api

  const formControl = (
    <RB.FormControl
      componentClass={rows ? 'textarea' : undefined}
      type={password ? 'password' : undefined}
      rows={rows}
      {...passedProps}
      value={getValue('')}
      onChange={e => setValue((e.target as any).value)}
      onBlur={() => setTouched()}
    />
  )

  return (
    <Wrapper2 {...props} {...api}>
      {(addonBefore || addonAfter) ? (
        <RB.InputGroup>
          {addonBefore}
          {formControl}
          {addonAfter}
        </RB.InputGroup>
      ) : (
        formControl
      )}
    </Wrapper2>
  )
}

type TextField2Props = InputFormField2
const TextField2 = (props: TextField2Props) => {
  return (
    <RF2.FormField field={props.name}>
      {api => {
        const { label, help, rows,
          password, addonBefore, addonAfter, ...passedProps } = props
        const { setValue, getValue, setTouched } = api

        const formControl = (
          <RB.FormControl
            componentClass={rows ? 'textarea' : undefined}
            type={password ? 'password' : undefined}
            rows={rows}
            {...passedProps}
            value={getValue('')}
            onChange={e => setValue((e.target as any).value)}
            onBlur={() => setTouched()}
          />
        )

        return (
          <Wrapper2 {...props} {...api}>
            {(addonBefore || addonAfter) ? (
              <RB.InputGroup>
                {addonBefore}
                {formControl}
                {addonAfter}
              </RB.InputGroup>
            ) : (
              formControl
            )}
          </Wrapper2>
        )
      }
    }
    </RF2.FormField>
  )
}

type PasswordField2Props = TextField2Props
const PasswordField2 = <V extends {}>(props: PasswordField2Props) =>
  <TextField2 password {...props} />

type TextFieldProps<V> = InputFormField<V>
const TextField = <V extends {}>(props: TextFieldProps<V>) => {
  return <RF.Field {...props} component={renderInput}/>
}

const additionalProps = (obj: object) => obj as any

type PasswordFieldProps<V> = InputFormField<V>
const PasswordField = <V extends {}>(props: PasswordFieldProps<V>) => {
  return <RF.Field {...props} component={renderInput} {...additionalProps({password: true})}/>
}

// url ------------------------------------------------------------------------
interface UrlFieldProps<V> extends FormField<V> {
  favicoName: keyof V
}

interface UrlFieldProps2 extends FormField2 {
  favicoName: string
}

type RenderUrlProps = UrlFieldProps<any> & WrapperProps & {
  change: typeof RF.change
}

const enhanceUrl = compose(
  connect(
    undefined,
    mapDispatchToProps({ change: RF.change })
  ),
  mapPropsStream(
    (props$: Rx.Observable<RenderUrlProps>) => {
      const changeIcon$ = props$
        .pluck<RenderUrlProps, string>('input', 'value')
        .distinctUntilChanged()
        .debounceTime(500)
        // .do((url) => console.log(`getting favicon for ${url}`))
        .switchMap(getFaviconStream)
        .withLatestFrom(props$, (icon, props) => {
          const { change, meta: { form }, favicoName } = props
          change(form, favicoName, icon || '')
        })

      return props$.merge(changeIcon$.ignoreElements())
    }
  ),
)

interface EnhancedUrlProps {
  url: string
  favico: string
  setFavico: RF2.BoundFormAPI['setValue']
}
const enhanceUrl2 = mapPropsStream<EnhancedUrlProps, EnhancedUrlProps>(
  (props$: Rx.Observable<EnhancedUrlProps>) => {
    const changeIcon$ = props$
      .pluck<EnhancedUrlProps, string>('url')
      .distinctUntilChanged()
      .debounceTime(500)
      .switchMap(getFaviconStream)
      .withLatestFrom(props$, (icon, props) => {
        icon = icon || ''
        const { url, favico, setFavico } = props
        if (favico !== icon) {
          setFavico(icon)
        }
      })

    return props$.merge(changeIcon$.ignoreElements())
  }
)

const renderUrl = enhanceUrl((props: RenderUrlProps) => {
  const { favicoName, change, ...inputProps } = props
  return renderInput(inputProps)
})

const renderFavico = (props: RF.WrappedFieldProps) => {
  const { input: { value, onChange } } = props
  return <RB.InputGroup.Button>
    <IconPicker value={value} onChange={onChange} />
  </RB.InputGroup.Button>
}

const UrlField = <V extends {}>(props: UrlFieldProps<V> & RF.WrappedFieldProps) => {
  const { favicoName } = props
  return <RF.Field {...props} component={renderUrl}
    {...additionalProps({
      addonBefore:
        <RF.Field
          component={renderFavico}
          {...additionalProps({name: favicoName})}
        />
    })}
  />
}

const UrlField2 = (props: UrlFieldProps2 & Wrapper2Props) => {
  const { name, favicoName } = props

  const FavicoAddon = enhanceUrl2(props =>
    <RB.InputGroup.Addon>
      <Favico value={props.favico}/>
    </RB.InputGroup.Addon>
  )

  return (
    <RF2.FormField field={name}>
      {api =>
        <Wrapper2 {...props} {...api}>
          <RB.InputGroup>
            <RF2.FormField field={favicoName}>
              {favicoApi =>
                <FavicoAddon
                  url={api.getValue('')}
                  favico={favicoApi.getValue('')}
                  setFavico={favicoApi.setValue}
                />
              }
            </RF2.FormField>
            <RB.FormControl
              type='text'
              value={api.getValue('')}
              onChange={e => api.setValue((e as any).target.value)}
              onBlur={() => api.setTouched()}
            />
          </RB.InputGroup>
        </Wrapper2>
      }
    </RF2.FormField>
  )
}

// color ----------------------------------------------------------------------
const renderColor = (props: RF.WrappedFieldProps) => {
  const { input: { value, onChange } } = props
  return <ColorPicker value={value} onChange={onChange as any} />
}

interface ColorAddonFieldProps<V> {
  name: keyof V
}

const ColorAddonField = <V extends {}>(props: ColorAddonFieldProps<V> & RF.WrappedFieldProps) => {
  return <RB.InputGroup.Button>
    <RF.Field {...additionalProps(props)} component={renderColor}/>
  </RB.InputGroup.Button>
}

const ColorAddonField2 = <V extends {}>(props: ColorAddonFieldProps<V>) =>
  <RF2.FormField field={props.name}>
    {api =>
      <RB.InputGroup.Button>
        <ColorPicker
          value={api.getValue('')}
          onChange={value => api.setValue(value)}
        />
      </RB.InputGroup.Button>
    }
  </RF2.FormField>

// select ---------------------------------------------------------------------
export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
}

type SelectFieldProps<V> = FormField<V> & ReactSelect.ReactCreatableSelectProps & {
  createable?: boolean
  parse?: (value: any) => any
  format?: (value: any) => string
  options: (SelectOption | any)[]
  placeholderMessage?: FormattedMessage.MessageDescriptor
}

const noop = () => undefined
const fixSelectProps = {
  menuContainerStyle: { zIndex: 5 }, // https://github.com/JedWatson/react-select/issues/1076
  onBlur: noop, // https://github.com/erikras/redux-form/issues/1185
}

const renderSelect = (props: SelectFieldProps<any> & WrapperProps) => {
  const { input, meta: { warning, error }, createable, label, ...passedProps } = props
  const Component = createable ? ReactSelect.Creatable : ReactSelect
  return (
    <Wrapper {...props}>
      <Component
        {...passedProps as any}
        {...input}
        {...fixSelectProps}
      />
    </Wrapper>
  )
}

const SelectField = injectIntl(<V extends {}>(props: SelectFieldProps<V> & InjectedIntlProps) => {
  const { placeholderMessage, intl: { formatMessage } } = props
  let { placeholder, parse } = props
  if (placeholderMessage) {
    placeholder = formatMessage(placeholderMessage)
  }

  if (!parse) {
    const valueOf = (value?: SelectOption): string => {
      if (!value) {
        return ''
      }
      return (value as any)[props.valueKey || 'value']
    }

    parse = (value: any) => {
      if (value && props.multi) {
        return (value as SelectOption[])
          .sort((a, b) => props.options.indexOf(a) - props.options.indexOf(b))
          .map(valueOf)
          .join(props.delimiter || ',')
      } else {
        return valueOf(value)
      }
    }
  }

  return <RF.Field {...additionalProps(props)} component={renderSelect} placeholder={placeholder} parse={parse}/>
}) as any as <V extends {}>(props: SelectFieldProps<V>) => JSX.Element

const enhanceSelectField2 = compose<SelectFieldProps<string> & InjectedIntlProps, SelectFieldProps<string>>(
  injectIntl,
)

const fixSelectProps2 = {
  menuContainerStyle: { zIndex: 5 }, // https://github.com/JedWatson/react-select/issues/1076
}

const SelectField2 = enhanceSelectField2(props => {
  const Component: typeof ReactSelect.Creatable = props.createable ? ReactSelect.Creatable : ReactSelect
  const { placeholderMessage, intl: { formatMessage } } = props
  const placeholder = props.placeholderMessage ? props.intl.formatMessage(props.placeholderMessage) : props.placeholder

  const valueOf = (value?: SelectOption): string => {
    if (!value) {
      return ''
    }
    return (value as any)[props.valueKey || 'value']
  }

  const parse = (value: any) => {
    if (value && props.multi) {
      return (value as SelectOption[])
        .sort((a, b) => props.options.indexOf(a) - props.options.indexOf(b))
        .map(valueOf)
        .join(props.delimiter || ',')
    } else {
      return valueOf(value)
    }
  }

  return <RF2.FormField field={props.name}>
    {api =>
      <Wrapper2 {...props} {...api}>
        <Component
          {...props}
          {...fixSelectProps2}
          placeholder={placeholder}
          onChange={value => api.setValue(parse(value))}
          onBlur={() => api.setTouched()}
          value={api.getValue()}
        />
      </Wrapper2>
    }
  </RF2.FormField>
}) as any as <V extends {}>(props: SelectFieldProps<V>) => JSX.Element

const selectFieldParse = (value?: SelectOption): string => {
  if (!value) {
    return ''
  }
  return value.value
}

// account --------------------------------------------------------------------
type AccountFieldProps<V> = FormField<V>
const renderAccount = (props: AccountFieldProps<any> & RF.WrappedFieldProps) => {
  const { input } = props
  return <Wrapper {...props}>
    <AccountPicker
      {...props as any}
      {...input}
      {...fixSelectProps}
    />
  </Wrapper>
}

const AccountField = <V extends {}>(props: AccountFieldProps<V>) => {
  return <RF.Field component={renderAccount} {...props as any} parse={selectFieldParse}/>
}

const AccountField2 = <V extends {}>(props: AccountFieldProps<V>) => {
  return <RF2.FormField field={props.name}>
    {api =>
      <Wrapper2 {...props} {...api}>
        <AccountPicker
          onChange={value => api.setValue(value as any)}
          value={api.getValue('')}
          {...fixSelectProps2}
        />
      </Wrapper2>
    }
  </RF2.FormField>
}

// budget ---------------------------------------------------------------------
type BudgetFieldProps<V> = FormField<V>
const renderBudget = (props: BudgetFieldProps<any> & RF.WrappedFieldProps) => {
  const { input } = props
  return <Wrapper {...props}>
    <BudgetPicker
      {...props as any}
      {...input}
      {...fixSelectProps}
    />
  </Wrapper>
}

const BudgetField = <V extends {}>(props: BudgetFieldProps<V>) => {
  return <RF.Field component={renderBudget} {...props as any} parse={selectFieldParse}/>
}

const BudgetField2 = <V extends {}>(props: BudgetFieldProps<V>) => {
  return <RF2.FormField field={props.name}>
    {api =>
      <Wrapper2 {...props} {...api}>
        <BudgetPicker
          onChange={value => api.setValue(value as any)}
          value={api.getValue('')}
          {...fixSelectProps2}
        />
      </Wrapper2>
    }
  </RF2.FormField>
}

// date -----------------------------------------------------------------------
interface DateFieldProps<V> extends FormField<V>, DatePickerProps {
}

const renderDate = (props: DateFieldProps<any> & WrapperProps) => {
  const { input, meta: { warning, error }, name, help, label, ...passedProps } = props
  return (
    <Wrapper {...props}>
      <DatePicker {...input as any} {...passedProps} />
    </Wrapper>
  )
}

const DateField = <V extends {}>(props: DateFieldProps<V>) => {
  return <RF.Field {...props} component={renderDate}/>
}

const DateField2 = <V extends {}>(props: DateFieldProps<V>) => {
  return <RF2.FormField field={props.name}>
    {api =>
      <Wrapper2 {...props} {...api}>
        <DatePicker
          onChange={value => api.setValue(value)}
          value={api.getValue('')}
        />
      </Wrapper2>
    }
  </RF2.FormField>
}

// checkbox -------------------------------------------------------------------
interface CheckboxFieldProps<V> extends FormField<V> {
  message: FormattedMessage.MessageDescriptor
}

const renderCheckbox = (props: CheckboxFieldProps<any> & WrapperProps) => {
  const { input, meta: { warning, error }, label, message, ...passedProps } = props
  return (
    <Wrapper {...props}>
      <RB.Checkbox {...input} checked={input.value}>
        <FormattedMessage {...message}/>
      </RB.Checkbox>
    </Wrapper>
  )
}

const CheckboxField = <V extends {}>(props: CheckboxFieldProps<V>) => {
  return <RF.Field {...props} component={renderCheckbox}/>
}

const CheckboxField2 = <V extends {}>(props: CheckboxFieldProps<V>) => {
  return <RF2.FormField field={props.name}>
    {api =>
      <Wrapper2 {...props} {...api}>
        <RB.Checkbox
          onChange={e => api.setValue((e.target as any).checked)}
          checked={api.getValue(false)}
          onBlur={() => api.setTouched()}
        >
          <FormattedMessage {...props.message}/>
        </RB.Checkbox>
      </Wrapper2>
    }
  </RF2.FormField>
}

// Collapse -------------------------------------------------------------------
interface CollapseFieldProps<V> extends RB.CollapseProps {
  name: keyof V
}

const renderCollapse = (props: CollapseFieldProps<any> & RF.WrappedFieldProps & React.Props<any>) => {
  const { input, meta, name, children, ...passedProps } = props
  return <RB.Collapse {...passedProps} in={!!input.value}>
    {props.children}
  </RB.Collapse>
}

const CollapseField = <V extends {}>(props: CollapseFieldProps<V> & React.Props<any>) => {
  return <RF.Field {...props} component={renderCollapse}/>
}

const CollapseField2 = <V extends {}>(props: CollapseFieldProps<V> & React.Props<any>) => {
  const { children, ...passedProps } = props
  return <RF2.FormField field={props.name}>
    {api =>
      <RB.Collapse {...passedProps} in={api.getValue(false)}>
        {props.children}
      </RB.Collapse>
    }
  </RF2.FormField>
}

// ----------------------------------------------------------------------------
// formComponent --------------------------------------------------------------

export type SubmitHandler<V> = RF.SubmitHandler<V, any>

const normalLayout: LayoutConfig = {
  label: {},
  control: {},
  nolabel: {}
}

const horizontalLayout: LayoutConfig = {
  label: { sm: 2 },
  control: { sm: 10 },
  nolabel: { smOffset: 2, sm: 10 }
}

const enhanceFormLayout = compose<RB.FormProps, RB.FormProps>(
  withContext<{ layout: LayoutConfig }, RB.FormProps>(
    { layout: PropTypes.object },
    ({ horizontal }) => ({
      layout: (horizontal ? horizontalLayout : normalLayout)
    })
  )
)

export const FormLayout = enhanceFormLayout(({ children, ...props }) => {
  return (
    <RB.Form {...props}>
      {children}
    </RB.Form>
  )
})

interface FormLayoutProps<V = any> extends RF2.FormProps<V> {
  horizontal?: boolean
}
const enhanceFormLayout2 = compose<FormLayoutProps, FormLayoutProps>(
  withContext<{ layout: LayoutConfig }, RB.FormProps>(
    { layout: PropTypes.object },
    ({ horizontal }) => ({
      layout: (horizontal ? horizontalLayout : normalLayout)
    })
  )
)

export const FormLayout2 = enhanceFormLayout2(({ children, horizontal, ...props }) => {
  return (
    <RF2.Form {...props}>
      {api =>
        <RB.Form
          horizontal={horizontal}
          onSubmit={e => {
            e.preventDefault()
            api.submitForm()
          }}
        >
          {typeof children === 'function' && children(api)}
        </RB.Form>
      }
    </RF2.Form>
  )
})

export const typedFields = <V extends {}>() => {
  return {
    Form: FormLayout,
    Form2: FormLayout2 as React.ComponentClass<FormLayoutProps<V>>,
    TextField2: TextField2 as React.StatelessComponent<TextFieldProps<V>>,
    TextField: TextField as React.StatelessComponent<TextFieldProps<V>>,
    PasswordField: PasswordField as React.StatelessComponent<PasswordFieldProps<V>>,
    PasswordField2: PasswordField2 as React.StatelessComponent<PasswordFieldProps<V>>,
    UrlField: UrlField as React.StatelessComponent<UrlFieldProps<V>>,
    UrlField2: UrlField2 as React.StatelessComponent<UrlFieldProps<V>>,
    SelectField: SelectField as React.StatelessComponent<SelectFieldProps<V>>,
    SelectField2: SelectField2 as React.StatelessComponent<SelectFieldProps<V>>,
    CheckboxField: CheckboxField as React.StatelessComponent<CheckboxFieldProps<V>>,
    CheckboxField2: CheckboxField2 as React.StatelessComponent<CheckboxFieldProps<V>>,
    DateField: DateField as React.StatelessComponent<DateFieldProps<V>>,
    DateField2: DateField2 as React.StatelessComponent<DateFieldProps<V>>,
    AccountField: AccountField as React.StatelessComponent<AccountFieldProps<V>>,
    AccountField2: AccountField2 as React.StatelessComponent<AccountFieldProps<V>>,
    BudgetField: BudgetField as React.StatelessComponent<BudgetFieldProps<V>>,
    BudgetField2: BudgetField2 as React.StatelessComponent<BudgetFieldProps<V>>,
    CollapseField: CollapseField as React.StatelessComponent<CollapseFieldProps<V>>,
    CollapseField2: CollapseField2 as React.StatelessComponent<CollapseFieldProps<V>>,
    ColorAddon: ColorAddonField as React.StatelessComponent<ColorAddonFieldProps<V>>,
    ColorAddon2: ColorAddonField2 as React.StatelessComponent<ColorAddonFieldProps<V>>,
  }
}
