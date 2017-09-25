declare module 'react-form' {
  export type FieldValue = string | number | boolean
  export interface FormValues {
    [key: string]: FieldValue
  }

  export interface FormErrors {
    [key: string]: string | undefined | null
  }

  export interface FormTouched {
    [key: string]: boolean
  }

  export interface FormState {
    values: FormValues
    errors: FormErrors
    nestedErrors: FormErrors
    touched: FormTouched
  }

  export interface FormPropsBase<V = FormValues, P = FormProps> {
    defaultValues?: Partial<V>
    loadState?: (props: P, instance: FormAPI) => FormState | undefined
    preValidate?: (values: V, state: FormState, props: P, instance: FormAPI) => V
    validate?: (values: V, state: FormState, props: P, instance: FormAPI) => FormErrors
    onValidationFail?: (values: V, state: FormState, props: P, instance: FormAPI) => void
    onChange?: (state: FormState, props: P, initial: boolean, instance: FormAPI) => void
    saveState?: (state: FormState, props: P, instance: FormAPI) => void
    willUnmount?: (state: FormState, props: P, instance: FormAPI) => void
    preSubmit?: (values: V, state: FormState, props: P, instance: FormAPI) => V
    onSubmit?: (values: V, state: FormState, props: P, instance: FormAPI) => void
    postSubmit?: (values: V, state: FormState, props: P, instance: FormAPI) => void
    component?: string | false | React.ComponentType<any>
  }

  export interface FormProps<V = FormValues> extends FormPropsBase<V> {
    children?: (props: FormAPI) => React.ReactNode
  }

  interface BaseFormAPI {
    setAllValues: (values: FormValues, noTouch?: boolean) => void
    setAllTouched: (value?: boolean) => void
    resetForm: () => void
    submitForm: () => void
  }

  export interface FormAPI extends BaseFormAPI {
    setValue: (field: string, value: FieldValue, noTouch?: boolean) => void
    getValue: <T extends FieldValue>(field: string, fallback?: T) => T
    setNestedError: (field: string, value: FieldValue) => void
    getError: (field: string) => string | undefined
    setTouched: (field: string, value?: boolean) => void
    getTouched: (field: string) => boolean
    addValue: <T extends FieldValue>(field: string, value: T) => void
    removeValue: (field: string, index: number) => void
    swapValues: (field: string, i: number, j: number) => void
  }

  export interface BoundFormAPI extends BaseFormAPI {
    setValue: (value: FieldValue, noTouch?: boolean) => void
    getValue: <T extends FieldValue>(fallback?: T) => T
    setNestedError: (value: FieldValue) => void
    getError: () => string | undefined
    setTouched: (value?: boolean) => void
    getTouched: () => boolean
    addValue: <T extends FieldValue>(value: T) => void
    removeValue: (index: number) => void
    swapValues: (i: number, j: number) => void
  }

  export class Form extends React.Component<FormProps> {}

  export interface ComponentBaseProps {
    field: string
    showErrors?: boolean
    errorBefore?: boolean
    noTouch?: boolean
    onBlur?: Function
    onChange?: Function
  }

  export interface FormFieldProps extends ComponentBaseProps {
    children?: (props: FormAPI) => any
  }
  export interface BoundFormFieldProps extends ComponentBaseProps {
    field: string
    children?: (props: BoundFormAPI) => any
  }
  export class FormField extends React.Component<BoundFormFieldProps> {}

  export interface TextProps extends ComponentBaseProps {}
  export class Text extends React.Component<TextProps> {}
}
