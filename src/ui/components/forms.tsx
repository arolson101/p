import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as RB from 'react-bootstrap'
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { default as ReactSelect, Creatable, ReactCreatableSelectProps } from 'react-select'
import 'react-select/dist/react-select.css'
import { compose, mapPropsStream, withContext } from 'recompose'
import { createSelector } from 'reselect'
import * as Rx from 'rxjs/Rx'
import * as RF from 'react-form'
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

type WrapperProps = FormField & RF.BoundFormAPI & React.Props<any>
const Wrapper = (props: WrapperProps, { layout }: LayoutProps) => {
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

(Wrapper as any).contextTypes = { layout: PropTypes.object }

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

const TextField = (props: TextFieldProps) => {
  return (
    <RF.FormField field={props.name}>
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
          <Wrapper {...props} {...api}>
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
    }
    </RF.FormField>
  )
}

type PasswordFieldProps<V = any> = TextFieldProps<V>
const PasswordField = <V extends {}>(props: PasswordFieldProps) =>
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

const UrlField = (props: UrlFieldProps & WrapperProps) => {
  const { name, favicoName } = props

  const FavicoAddon = enhanceUrl(props =>
    <RB.InputGroup.Addon>
      <Favico value={props.favico}/>
    </RB.InputGroup.Addon>
  )

  return (
    <RF.FormField field={name}>
      {api =>
        <Wrapper {...props} {...api}>
          <RB.InputGroup>
            <RF.FormField field={favicoName}>
              {favicoApi =>
                <FavicoAddon
                  url={api.getValue('')}
                  favico={favicoApi.getValue('')}
                  setFavico={favicoApi.setValue}
                />
              }
            </RF.FormField>
            <RB.FormControl
              type='text'
              value={api.getValue('')}
              onChange={e => api.setValue((e as any).target.value)}
              onBlur={() => api.setTouched()}
            />
          </RB.InputGroup>
        </Wrapper>
      }
    </RF.FormField>
  )
}

// color ----------------------------------------------------------------------
interface ColorAddonFieldProps<V> {
  name: keyof V
}
const ColorAddonField = <V extends {}>(props: ColorAddonFieldProps<V>) =>
  <RF.FormField field={props.name}>
    {api =>
      <RB.InputGroup.Button>
        <ColorPicker
          value={api.getValue('')}
          onChange={value => api.setValue(value)}
        />
      </RB.InputGroup.Button>
    }
  </RF.FormField>

// select ---------------------------------------------------------------------
export interface SelectOption {
  value: any
  label: string
  disabled?: boolean
}

type SelectFieldProps<V> = FormField<V> & ReactCreatableSelectProps & {
  createable?: boolean
  parse?: (value: any) => any
  format?: (value: any) => string
  options: (SelectOption | any)[]
  placeholderMessage?: FormattedMessage.MessageDescriptor
}

const fixSelectProps = {
  menuContainerStyle: { zIndex: 5 }, // https://github.com/JedWatson/react-select/issues/1076
}

const SelectField = <V extends {}>(props: SelectFieldProps<V>) => {
  const Component: typeof Creatable = props.createable ? Creatable : ReactSelect

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

  return <RF.FormField field={props.name}>
    {api =>
      <Wrapper {...props} {...api}>
        <Component
          {...props}
          {...fixSelectProps}
          placeholder={props.placeholderMessage &&
            <FormattedMessage {...props.placeholderMessage}/>
          }
          onChange={value => {
            api.setValue(parse(value))
            if (props.onChange) {
              props.onChange(value)
            }
          }}
          onBlur={() => api.setTouched()}
          value={api.getValue()}
        />
      </Wrapper>
    }
  </RF.FormField>
}

// account --------------------------------------------------------------------
type AccountFieldProps<V> = FormField<V>
const AccountField = <V extends {}>(props: AccountFieldProps<V>) => {
  return <RF.FormField field={props.name}>
    {api =>
      <Wrapper {...props} {...api}>
        <AccountPicker
          onChange={value => api.setValue(value as any)}
          value={api.getValue('')}
          {...fixSelectProps}
        />
      </Wrapper>
    }
  </RF.FormField>
}

// budget ---------------------------------------------------------------------
type BudgetFieldProps<V> = FormField<V>
const BudgetField = <V extends {}>(props: BudgetFieldProps<V>) => {
  return <RF.FormField field={props.name}>
    {api =>
      <Wrapper {...props} {...api}>
        <BudgetPicker
          onChange={value => api.setValue(value as any)}
          value={api.getValue('')}
          {...fixSelectProps}
        />
      </Wrapper>
    }
  </RF.FormField>
}

// date -----------------------------------------------------------------------
interface DateFieldProps<V> extends FormField<V>, DatePickerProps {
}
const DateField = <V extends {}>(props: DateFieldProps<V>) => {
  const { addonBefore, addonAfter } = props
  return <RF.FormField field={props.name}>
    {api => {
      const component = (
        <DatePicker
          onChange={value => api.setValue(value)}
          value={api.getValue('')}
        />
      )

      return (
        <Wrapper {...props} {...api}>
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
    }}
  </RF.FormField>
}

// checkbox -------------------------------------------------------------------
interface CheckboxFieldProps<V> extends FormField<V> {
  message: FormattedMessage.MessageDescriptor
}
const CheckboxField = <V extends {}>(props: CheckboxFieldProps<V>) => {
  return <RF.FormField field={props.name}>
    {api =>
      <Wrapper {...props} {...api}>
        <RB.Checkbox
          onChange={e => api.setValue((e.target as any).checked)}
          checked={api.getValue(false)}
          onBlur={() => api.setTouched()}
        >
          <FormattedMessage {...props.message}/>
        </RB.Checkbox>
      </Wrapper>
    }
  </RF.FormField>
}

// Collapse -------------------------------------------------------------------
interface CollapseFieldProps<V> extends RB.CollapseProps {
  name: keyof V
}
const CollapseField = <V extends {}>(props: CollapseFieldProps<V> & React.Props<any>) => {
  const { children, ...passedProps } = props
  return <RF.FormField field={props.name}>
    {api =>
      <RB.Collapse {...passedProps} in={api.getValue(false)}>
        {props.children}
      </RB.Collapse>
    }
  </RF.FormField>
}

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
