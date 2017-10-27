import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as RB from 'react-bootstrap'
import * as RF from 'react-form'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { default as ReactSelect, Creatable, ReactCreatableSelectProps } from 'react-select'
import 'react-select/dist/react-select.css'
import { compose, mapPropsStream, withContext } from 'recompose'
import { createSelector } from 'reselect'
import * as Rx from 'rxjs/Rx'
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

interface FormField<V = any> {
  name: keyof V
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

type WrapperProps = RF.BoundFormAPI & React.Props<any> & {
  label: FormattedMessage.MessageDescriptor
  help?: FormattedMessage.MessageDescriptor
}
const Wrapper: React.SFC<WrapperProps> = (props: WrapperProps, { layout }: LayoutProps) => {
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

Wrapper.contextTypes = { layout: PropTypes.object }

// input ----------------------------------------------------------------------
interface TextFieldProps<V = any> extends FormField /*, RB.FormControlProps*/ {
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

const TextComponent: React.SFC<TextFieldProps> = (props: TextFieldProps & RF.FieldComponentProps) => {
  const { label, help, rows, fieldApi,
    password, addonBefore, addonAfter, ...passedProps } = props
  const { setValue, getValue, setTouched } = fieldApi

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
    <Wrapper label={label} help={help} {...fieldApi}>
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

const TextField = (props: TextFieldProps) => {
  // https://github.com/react-tools/react-form/issues/133
  const { addonBefore, addonAfter, ...rest} = props
  return <RF.FormField field={props.name}>
    <TextComponent {...rest} />
  </RF.FormField>
}

type PasswordFieldProps<V = any> = TextFieldProps<V>
const PasswordField = (props: PasswordFieldProps) =>
  <TextField password {...props} />

// url ------------------------------------------------------------------------
interface UrlFieldProps<V = any> extends FormField<V> {
  favicoName: string
}

interface EnhancedUrlProps {
  url: string
  favico: string
  setFavico: RF.BoundFormAPI['setValue']
}
const enhanceUrl = mapPropsStream<EnhancedUrlProps, EnhancedUrlProps>(
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

const UrlComponent: React.SFC<UrlFieldProps & WrapperProps> = (props: UrlFieldProps & WrapperProps & RF.FieldComponentProps) => {
  const { name, favicoName, fieldApi } = props
  const FavicoAddon = enhanceUrl(props =>
    <RB.InputGroup.Addon>
      <Favico value={props.favico}/>
    </RB.InputGroup.Addon>
  )

  const FavicoComponent: React.SFC<any> = (favicoProps: RF.FieldComponentProps) => {
    const favicoApi = favicoProps.fieldApi
    return <FavicoAddon
      url={fieldApi.getValue('')}
      favico={favicoApi.getValue('')}
      setFavico={favicoApi.setValue}
    />
  }

  return <Wrapper {...props} {...fieldApi}>
    <RB.InputGroup>
      <RF.FormField field={favicoName}>
        <FavicoComponent/>
      </RF.FormField>
      <RB.FormControl
        type='text'
        value={fieldApi.getValue('')}
        onChange={e => fieldApi.setValue((e as any).target.value)}
        onBlur={() => fieldApi.setTouched()}
      />
    </RB.InputGroup>
  </Wrapper>
}

const UrlField = (props: UrlFieldProps & WrapperProps) =>
  <RF.FormField field={props.name}>
    <UrlComponent {...props}/>
  </RF.FormField>

// color ----------------------------------------------------------------------
interface ColorAddonFieldProps<V = {}> {
  name: keyof V
}

const ColorAddonComponent: React.SFC<any> = ({fieldApi}: RF.FieldComponentProps) =>
  <RB.InputGroup.Button>
    <ColorPicker
      value={fieldApi.getValue('')}
      onChange={value => fieldApi.setValue(value)}
    />
  </RB.InputGroup.Button>

const ColorAddonField = (props: ColorAddonFieldProps) =>
  <RF.FormField field={props.name}>
    <ColorAddonComponent/>
  </RF.FormField>

// select ---------------------------------------------------------------------
export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
}

type SelectFieldProps<V = {}> = FormField<V> & ReactCreatableSelectProps & {
  createable?: boolean
  parse?: (value: any) => any
  format?: (value: any) => string
  options: (SelectOption | any)[]
  placeholderMessage?: FormattedMessage.MessageDescriptor
}

const fixSelectProps = {
  menuContainerStyle: { zIndex: 5 }, // https://github.com/JedWatson/react-select/issues/1076
}

const SelectComponent: React.SFC<SelectFieldProps> = (props: SelectFieldProps & RF.FieldComponentProps) => {
  const Component: typeof Creatable = props.createable ? Creatable : ReactSelect
  const { fieldApi } = props

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

  return <Wrapper {...props} {...fieldApi}>
    <Component
      {...props}
      {...fixSelectProps}
      placeholder={props.placeholderMessage &&
        <FormattedMessage {...props.placeholderMessage}/>
      }
      onChange={value => {
        fieldApi.setValue(parse(value))
        if (props.onChange) {
          props.onChange(value)
        }
      }}
      onBlur={() => fieldApi.setTouched()}
      value={fieldApi.getValue()}
    />
  </Wrapper>
}

const SelectField = (props: SelectFieldProps) =>
  <RF.FormField field={props.name}>
    <SelectComponent {...props}/>
  </RF.FormField>

// account --------------------------------------------------------------------
type AccountFieldProps<V = {}> = FormField<V>

const AccountComponent: React.SFC<AccountFieldProps> = (props: AccountFieldProps & RF.FieldComponentProps) => {
  const { fieldApi } = props
  return <Wrapper {...props} {...fieldApi}>
    <AccountPicker
      onChange={value => fieldApi.setValue(value as any)}
      value={fieldApi.getValue('')}
      {...fixSelectProps}
    />
  </Wrapper>
}

const AccountField = (props: AccountFieldProps) =>
  <RF.FormField field={props.name}>
    <AccountComponent {...props}/>
  </RF.FormField>

// budget ---------------------------------------------------------------------
type BudgetFieldProps<V = {}> = FormField<V>

const BudgetComponent: React.SFC<BudgetFieldProps> = (props: BudgetFieldProps & RF.FieldComponentProps) => {
  const { fieldApi } = props
  return <Wrapper {...props} {...fieldApi}>
    <BudgetPicker
      onChange={value => fieldApi.setValue(value as any)}
      value={fieldApi.getValue('')}
      {...fixSelectProps}
    />
  </Wrapper>
}

const BudgetField = (props: BudgetFieldProps) =>
  <RF.FormField field={props.name}>
    <BudgetComponent {...props}/>
  </RF.FormField>

// date -----------------------------------------------------------------------
interface DateFieldProps<V = {}> extends FormField<V>, DatePickerProps {
}

const DateComponent: React.SFC<DateFieldProps> = (props: DateFieldProps & RF.FieldComponentProps) => {
  const { fieldApi, addonBefore, addonAfter } = props
  const component = (
    <DatePicker
      onChange={value => fieldApi.setValue(value)}
      value={fieldApi.getValue('')}
    />
  )

  return (
    <Wrapper {...props} {...fieldApi}>
      {(addonBefore || addonAfter) ? (
        <RB.InputGroup>
          {addonBefore}
          {component}
          {addonAfter}
        </RB.InputGroup>
      ) : (
        component
      )}
    </Wrapper>
  )
}

const DateField = (props: DateFieldProps) =>
  <RF.FormField field={props.name}>
    <DateComponent {...props}/>
  </RF.FormField>

// checkbox -------------------------------------------------------------------
interface CheckboxFieldProps<V = {}> extends FormField<V> {
  message: FormattedMessage.MessageDescriptor
}

const CheckboxComponent: React.SFC<CheckboxFieldProps> = (props: CheckboxFieldProps & RF.FieldComponentProps) => {
  const { fieldApi } = props
  return <Wrapper {...props} {...fieldApi}>
    <RB.Checkbox
      onChange={e => fieldApi.setValue((e.target as any).checked)}
      checked={fieldApi.getValue(false)}
      onBlur={() => fieldApi.setTouched()}
    >
      <FormattedMessage {...props.message}/>
    </RB.Checkbox>
  </Wrapper>
}

const CheckboxField = (props: CheckboxFieldProps) =>
  <RF.FormField field={props.name}>
    <CheckboxComponent {...props}/>
  </RF.FormField>

// Collapse -------------------------------------------------------------------
interface CollapseFieldProps<V = any> extends RB.CollapseProps {
  name: keyof V
}

const CollapseComponent: React.SFC<CollapseFieldProps> = (props: CollapseFieldProps & RF.FieldComponentProps & React.Props<any>) => {
  const { fieldApi, children, ...passedProps } = props
  return <RB.Collapse {...passedProps} in={fieldApi.getValue(false)}>
    {props.children}
  </RB.Collapse>
}

const CollapseField = (props: CollapseFieldProps & React.Props<any>) =>
  <RF.FormField field={props.name}>
    <CollapseComponent {...props}/>
  </RF.FormField>

// ----------------------------------------------------------------------------
// formComponent --------------------------------------------------------------

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

interface FormLayoutProps<V = any> extends RF.FormProps<V> {
  horizontal?: boolean
}
const enhanceFormLayout = compose<FormLayoutProps, FormLayoutProps>(
  withContext<{ layout: LayoutConfig }, RB.FormProps>(
    { layout: PropTypes.object },
    ({ horizontal }) => ({
      layout: (horizontal ? horizontalLayout : normalLayout)
    })
  )
)

export const FormLayout = enhanceFormLayout(({ children, horizontal, ...props }) => {
  return (
    <RF.Form {...props}>
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
    </RF.Form>
  )
})

export const typedFields = <V extends {}>() => {
  return {
    Form: FormLayout as React.ComponentClass<FormLayoutProps<V>>,
    TextField: TextField as React.StatelessComponent<TextFieldProps<V>>,
    PasswordField: PasswordField as React.StatelessComponent<PasswordFieldProps<V>>,
    UrlField: UrlField as React.StatelessComponent<UrlFieldProps<V>>,
    SelectField: SelectField as React.StatelessComponent<SelectFieldProps<V>>,
    CheckboxField: CheckboxField as React.StatelessComponent<CheckboxFieldProps<V>>,
    DateField: DateField as React.StatelessComponent<DateFieldProps<V>>,
    AccountField: AccountField as React.StatelessComponent<AccountFieldProps<V>>,
    BudgetField: BudgetField as React.StatelessComponent<BudgetFieldProps<V>>,
    CollapseField: CollapseField as React.StatelessComponent<CollapseFieldProps<V>>,
    ColorAddon: ColorAddonField as React.StatelessComponent<ColorAddonFieldProps<V>>,
  }
}
