import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import * as ReactSelect from 'react-select'
import { compose, mapPropsStream } from 'recompose'
import * as RF from 'redux-form'
import { createSelector } from 'reselect'
import * as Rx from 'rxjs/Rx'
import { getFavicon$ } from '../../../actions/index'
import { mapDispatchToProps } from '../../../state/index'
import { forms } from './index'
import { AccountPicker } from './AccountPicker'
import { BudgetPicker } from './BudgetPicker'
import { ColorPicker } from './ColorPicker'
import { DatePicker, DatePickerProps } from './DatePicker'
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

type WrapperProps = RF.WrappedFieldProps<string> & FormField<any> & React.Props<any>
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

type TextFieldProps<V> = InputFormField<V>
const TextField = <V extends {}>(props: TextFieldProps<V>) => {
  return <RF.Field {...props} component={renderInput}/>
}

type PasswordFieldProps<V> = InputFormField<V>
const PasswordField = <V extends {}>(props: PasswordFieldProps<V>) => {
  return <RF.Field {...props} component={renderInput} password/>
}

// url ------------------------------------------------------------------------
interface UrlFieldProps<V> extends FormField<V> {
  favicoName: keyof V
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
        .switchMap(getFavicon$)
        .withLatestFrom(props$, (icon, props) => {
          const { change, meta: { form }, favicoName } = props
          change(form, favicoName, icon || '')
        })

      return props$.merge(changeIcon$.ignoreElements())
    }
  ),
)

const renderUrl = enhanceUrl((props: RenderUrlProps) => {
  const { favicoName, change, ...inputProps } = props
  return renderInput(inputProps)
})

const renderFavico = (props: RF.WrappedFieldProps<any>) => {
  const { input: { value, onChange } } = props
  return <RB.InputGroup.Button>
     <IconPicker value={value} onChange={onChange} />
  </RB.InputGroup.Button>
}

const UrlField = <V extends {}>(props: UrlFieldProps<V> & RF.WrappedFieldProps<{}>) => {
  const { favicoName } = props
  return <RF.Field {...props} component={renderUrl}
    addonBefore={
      <RF.Field
        component={renderFavico}
        name={favicoName}
      />
    }
  />
}

// color ----------------------------------------------------------------------
const renderColor = (props: RF.WrappedFieldProps<any>) => {
  const { input: { value, onChange } } = props
  return <ColorPicker value={value} onChange={onChange as any} />
}

interface ColorAddonFieldProps<V> {
  name: keyof V
}

const ColorAddonField = <V extends {}>(props: ColorAddonFieldProps<V> & RF.WrappedFieldProps<{}>) => {
  return <RB.InputGroup.Button>
    <RF.Field {...props} component={renderColor}/>
  </RB.InputGroup.Button>
}

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

  return <RF.Field {...props} component={renderSelect} placeholder={placeholder} parse={parse}/>
}) as any as <V extends {}>(props: SelectFieldProps<V>) => JSX.Element

// account --------------------------------------------------------------------
type AccountFieldProps<V> = FormField<V>
const renderAccount = (props: AccountFieldProps<any> & RF.WrappedFieldProps<any>) => {
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
  return <RF.Field component={renderAccount} {...props as any}/>
}

// budget ---------------------------------------------------------------------
type BudgetFieldProps<V> = FormField<V>
const renderBudget = (props: BudgetFieldProps<any> & RF.WrappedFieldProps<any>) => {
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
  return <RF.Field component={renderBudget} {...props as any}/>
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

// Collapse -------------------------------------------------------------------
interface CollapseFieldProps<V> extends RB.CollapseProps {
  name: keyof V
}

const renderCollapse = (props: CollapseFieldProps<any> & RF.WrappedFieldProps<any>) => {
  const { input, meta, name, children, ...passedProps } = props
  return <RB.Collapse {...passedProps} in={!!input.value}>
    {props.children}
  </RB.Collapse>
}

const CollapseField = <V extends {}>(props: CollapseFieldProps<V>) => {
  return <RF.Field {...props} component={renderCollapse}/>
}

// ----------------------------------------------------------------------------
// formComponent --------------------------------------------------------------

interface Props<V> extends RF.FormProps<V, Props<V>, {}> {
  horizontal?: boolean
  onSubmit: SubmitHandler<V>
  onChanged?: ChangeCallback<V>
  validate?: (values: V) => RF.FormErrors<V>
}

export type SubmitHandler<V> = RF.SubmitHandler<V, any, any>
export type ChangeCallback<V> = (values: V, change: ChangeField<V>, dispatch: any, props: any) => void
export type ErrorCallback<V> = (errors: RF.FormErrors<V>) => void
export type ChangeField<V> = (field: keyof V, value: any) => void

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

export class FormLayout extends React.Component<RB.FormProps, any> {
  static childContextTypes = {
    layout: PropTypes.object
  }

  getChildContext () {
    return {
      layout: (this.props.horizontal ? horizontalLayout : normalLayout)
    }
  }

  render () {
    const { children, ...otherProps } = this.props
    return (
      <RB.Form
        {...otherProps}
      >
        {children}
      </RB.Form>
    )
  }
}

export const formMaker = <V extends {}>() => {
  return {
    Form: FormLayout,
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

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

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
  account: {
    id: 'forms.account',
    defaultMessage: 'account'
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
  date: {
    id: 'forms.date',
    defaultMessage: 'date'
  },
})

interface Values {
  text: string
  color: string
  password: string
  multiline: string
  select: string
  select2: string
  url: string
  favicon: string
  checkbox: boolean
  account: string
  date: string
}

const {
  Form,
  TextField: Text,
  PasswordField: Password,
  UrlField: Url,
  SelectField: Select,
  CheckboxField: Checkbox,
  DateField: Date,
  CollapseField: Collapse,
  ColorAddon,
  AccountField: Account
} = formMaker<Values>()
import { Validator } from '../../../util/index'

const enhance = compose<InjectedIntlProps & RF.FormProps<Values, any, any>, {}>(
  injectIntl,
  RF.reduxForm<Values, InjectedIntlProps, any>({
    form: 'test',
    onSubmit: (values, dispatch, props) => {
      const validator = new Validator(values, props.intl.formatMessage)
      validator.required('text', 'password')
      validator.maybeThrowSubmissionError()
      console.log('onSubmit', values)
    }
  }),
)

export const RenderTest = enhance(({handleSubmit}) => {
  return (
    <Form horizontal onSubmit={handleSubmit}>
      <Text name='text'
        label={testMessages.text}
        help={testMessages.text}
        autoFocus
        addonBefore={
          <ColorAddon name='color'/>
        }
      />
      <Password name='password'
        label={testMessages.password}
      />
      <Text name={'multiline'}
        label={testMessages.multiline}
        rows={4}
      />
      <Account name='account'
        label={testMessages.account}
      />
      <Checkbox name='checkbox'
        label={testMessages.checkbox}
        message={testMessages.checkboxmessage}
      />
      <Date name='date'
        label={testMessages.date}
      />
      <Url name='url'
        favicoName='favicon'
        label={testMessages.url}
      />
      <Collapse name='checkbox'>
        <div>
          <Select name='select'
            label={testMessages.select}
            placeholderMessage={testMessages.selectPlaceholder}
            options={[
              { label: 'option 1', value: 'value 1' },
              { label: 'option 2', value: 'value 2' },
              { label: 'option 3', value: 'value 3' },
            ]}
          />
          <Select name='select2'
            multi
            label={testMessages.select}
            placeholderMessage={testMessages.selectPlaceholder}
            options={[
              { label: 'option 1', value: 'value 1' },
              { label: 'option 2', value: 'value 2' },
              { label: 'option 3', value: 'value 3' },
            ]}
          />
        </div>
      </Collapse>

      <button type='submit'>submit</button>
    </Form>
  )
})
