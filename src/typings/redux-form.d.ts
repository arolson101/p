// Type definitions for redux-form v6.0.0
// Project: https://github.com/erikras/redux-form
// Definitions by: Daniel Lytkin <https://github.com/aikoven>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'redux-form' {
import * as React from 'react';
import { Component, SyntheticEvent, FormEventHandler } from 'react';
import { Dispatch, ActionCreator, Reducer } from 'redux';

export const actionTypes: {[actionName:string]: string};

export type FieldValue = any;

export interface FieldArrayErrors {
  _error: string;
  [key: string]: string;
}

export type ErrorsFor<TValues> = { [P in keyof TValues] ?: string | FieldArrayErrors | string[] }

export class SubmissionError<T> {
    constructor(errors: ErrorsFor<T>);
}

type FunctionalComponent<Props> = (props: Props) => any;
export type FieldComponent<Props> = React.Component<Props, any> | FunctionalComponent<Props> | string;

export interface FieldProps<Values, Props> {
    // A string path, in dot-and-bracket notation, corresponding to a value in the form values. It may be as simple as 'firstName' or as complicated as contact.billing.address[2].phones[1].areaCode. See the Usage section below for details.
    name: keyof Values

    // A Component, stateless function, or string corresponding to a default JSX element. See the Usage section below for details.
    component: FieldComponent<Props>

    // Formats the value from the Redux store to be displayed in the field input. Common use cases are to format Numbers into currencies or Dates into a localized date format.
    // format is called with the field value and name as arguments and should return the new formatted value to be displayed in the field input.
    // To respect React 15 input behavior there is defaultFormat = value => value == null ? '' : value internally used. To disable that you can pass null as format prop.
    format?: (value: any, name: any) => any

    // A function to convert whatever value the user has entered into the value that you want stored in the Redux store for the field. For instance, if you want the value to be in all uppercase, you would pass value => value.toUpperCase(). The parameters to your normalize function are:
    // value: The value entered by the user.
    // previousValue: The previous value for the field.
    // allValues: All the values in the entire form with the new value. This will be an Immutable Map if you are using Immutable JS.
    // previousAllValues: All the values in the entire form before the current change. This will be an Immutable Map if you are using Immutable JS.
    normalize?: (value: any, previousValue: any, allValues: Values, previousAllValues: Values) => any

    // Object with custom props to pass through the Field component into a component provided to component prop. This props will be merged to props provided by Field itself. This may be useful if you are using TypeScript. This construct is completely optional; the primary way of passing props along to your component is to give them directly to the Field component, but if, for whatever reason, you prefer to bundle them into a separate object, you may do so by passing them into props.
    props?: any

    // Parses the value given from the field input component to the type that you want stored in the Redux store. Common use cases are to parse currencies into Numbers into currencies or localized date formats into Dates.
    // parse is called with the field value and name as arguments and should return the new parsed value to be stored in the Redux store.
    parse?: (value: any, name: any) => any

    // Allows you to to provide a field-level validation rule. The function will be given the current value of the field and all the other form values. If the field is valid, it should return undefined, if the field is invalid, it should return an error (usually, but not necessarily, a String).
    validate?: (value: any, allValues: Values) => string

    // Allows you to to provide a field-level warning rule. The function will be given the current value of the field and all the other form values. If the field needs a warning, it should return the warning (usually, but not necessarily, a String). If the field does not need a warning, it should return undefined.
    warn?: (value: any, allValues: Values) => string

    // If true, the rendered component will be available with the getRenderedComponent() method. Defaults to false. Cannot be used if your component is a stateless function component.
    withRef?: boolean
}


export interface InjectedFieldInputProps<Name> {
  // An alias for value only when value is a boolean. Provided for convenience of destructuring
  // the whole field object into the props of a form element.
  checked?: boolean

  // The name prop passed in.
  name: Name

  // A function to call when the form field loses focus. It expects to either receive the React
  // SyntheticEvent or the current value of the field.
  onBlur: (eventOrValue: any) => any

  // A function to call when the form field is changed. It expects to either receive the React
  // SyntheticEvent or the new value of the field.
  onChange: (eventOrValue: any) => any

  // A function to call when the form field receives a dragStart event. Saves the field value
  // in the event for giving the field it is dropped into.
  onDragStart: (event: any) => any

  // A function to call when the form field receives a drop event.
  onDrop: (event: any) => any

  // A function to call when the form field receives focus.
  onFocus: (event: any) => any

  // The value of this form field. It will be a boolean for checkboxes, and a string for all
  // other input types. If there is no value in the Redux state for this field, it will default
  // to ''. This is to ensure that the input is controlled. If you require that the value be of
  // another type (e.g. Date or Number), you must provide initialValues to your form with the
  // desired type of this field.
  value: any
}


// The props under the meta key are metadata about the state of this field that redux-form is tracking for you.
export interface InjectedFieldMetaProps {

  // true if this field currently has focus. It will only work if you are passing onFocus to your input element.
  active: boolean

  // true if this field has been set with the AUTOFILL action and has not since been changed with
  // a CHANGE action. This is useful to render the field in a way that the user can tell that the
  // value was autofilled for them.
  autofilled: boolean

  // true if the form is currently running asynchronous validation because this field was blurred.
  asyncValidating: boolean

  // true if the field value has changed from its initialized value. Opposite of pristine.
  dirty: boolean

  // The Redux dispatch function.
  dispatch: Function

  // The error for this field if its value is not passing validation. Both synchronous, asynchronous,
  // and submit validation errors will be reported here.
  error?: string

  // The warning for this field if its value is not passing warning validation.
  warning?: string

  // true if the field value fails validation (has a validation error). Opposite of valid.
  invalid: boolean

  // true if the field value is the same as its initialized value. Opposite of dirty.
  pristine: boolean

  // true if the field is currently being submitted
  submitting: boolean

  // true if the field has been touched. By default this will be set when the field is blurred.
  touched: boolean

  // true if the field value passes validation (has no validation errors). Opposite of invalid.
  valid: boolean

  // true if this field has ever had focus. It will only work if you are passing onFocus to your input element.
  visited: boolean
}


export interface InjectedFieldProps<Name> {
  input: InjectedFieldInputProps<Name>
  meta: InjectedFieldMetaProps
}


export interface ReduxFormProps<TValues> {
    /**
     * The name of the currently active (with focus) field.
     */
    active: string;

    /**
     * A function that may be called to initiate asynchronous validation if
     * asynchronous validation is enabled.
     */
    asyncValidate: Function;

    /**
     * true if the asynchronous validation function has been called but has not
     * yet returned.
     */
    asyncValidating: boolean;

    /**
     * Destroys the form state in the Redux store. By default, this will be
     * called for you in componentWillUnmount().
     */
    destroyForm(): void;

    /**
     * true if the form data has changed from its initialized values. Opposite
     * of pristine.
     */
    dirty: boolean;

    /**
     * A generic error for the entire form given by the _error key in the
     * result from the synchronous validation function, the asynchronous
     * validation, or the rejected promise from onSubmit.
     */
    error: any;

    /**
     * A function meant to be passed to <form onSubmit={handleSubmit}> or to
     * <button onClick={handleSubmit}>. It will run validation, both sync and
     * async, and, if the form is valid, it will call
     * this.props.onSubmit(data) with the contents of the form data.
     * Optionally, you may also pass your onSubmit function to handleSubmit
     * which will take the place of the onSubmit prop. For example: <form
     * onSubmit={handleSubmit(this.save.bind(this))}> If your onSubmit
     * function returns a promise, the submitting property will be set to true
     * until the promise has been resolved or rejected. If it is rejected with
     * an object matching { field1: 'error', field2: 'error' } then the
     * submission errors will be added to each field (to the error prop) just
     * like async validation errors are. If there is an error that is not
     * specific to any field, but applicable to the entire form, you may pass
     * that as if it were the error for a field called _error, and it will be
     * given as the error prop.
     */
    handleSubmit(event: SyntheticEvent<any>): void;
    handleSubmit(event: React.MouseEvent<HTMLButtonElement>): void;
    handleSubmit(submit: (data: TValues, dispatch?: Dispatch<any>, props?: any) => Promise<any> | void): FormEventHandler<any>;

    /**
     * Initializes the form data to the given values. All dirty and pristine
     * state will be determined by comparing the current data with these
     * initialized values.
     * @param data
     */
    initializeForm(data: TValues): void;

    /**
     * true if the form has validation errors. Opposite of valid.
     */
    invalid: boolean;

    /**
     * true if the form data is the same as its initialized values. Opposite
     * of dirty.
     */
    pristine: boolean;

    /**
     * Resets all the values in the form to the initialized state, making it
     * pristine again.
     */
    resetForm(): void;

    /**
     * The same formKey prop that was passed in. See Editing Multiple Records.
     */
    formKey: string;

    /**
     * Whether or not your form is currently submitting. This prop will only
     * work if you have passed an onSubmit function that returns a promise. It
     * will be true until the promise is resolved or rejected.
     */
    submitting: boolean;

    /**
     * Starts as false. If onSubmit is called, and fails to submit for any
     * reason, submitFailed will be set to true. A subsequent successful
     * submit will set it back to false.
     */
    submitFailed: boolean;

    /**
     * Marks the given fields as "touched" to show errors.
     * @param field
     */
    touch(...field: string[]): void;

    /**
     * Marks all fields as "touched" to show errors. This will automatically
     * happen on form submission.
     */
    touchAll(): void;

    /**
     * Clears the "touched" flag for the given fields
     * @param field
     */
    untouch(...field: string[]): void;

    /**
     * Clears the "touched" flag for the all fields
     */
    untouchAll(): void;

    /**
     * true if the form passes validation (has no validation errors). Opposite
     * of invalid.
     */
    valid: boolean;

    /**
     * All of your values in the form { field1: <string>, field2: <string> }.
     */
    values: TValues;
}

interface ComponentDecorator<T> {
    (component: React.ComponentClass<T> | React.StatelessComponent<T>): React.ComponentClass<T>;
}

export function reduxForm<T, TValues>(
    config: ReduxFormConfig<T, TValues>
): ComponentDecorator<T>;

type FuncOrSelf<T> = T | (() => T);


export interface ReduxFormConfig<TOwnProps, TValues> {
    /**
     * a list of all your fields in your form. You may change these dynamically
     * at runtime.
     */
    fields?: string[];

    /**
     * the name of your form and the key to where your form's state will be
     * mounted under the redux-form reducer
     */
    form: string;

    /**
     * By default, async blur validation is only triggered if synchronous
     * validation passes, and the form is dirty or was never initialized (or if
     * submitting). Sometimes it may be desirable to trigger asynchronous
     * validation even in these cases, for example if all validation is performed
     * asynchronously and you want to display validation messages if a user does
     * not change a field, but does touch and blur it. Setting
     * alwaysAsyncValidate to true will always run asynchronous validation on
     * blur, even if the form is pristine or sync validation fails.
     */
    alwaysAsyncValidate?: boolean;

    /**
     * field names for which onBlur should trigger a call to the asyncValidate
     * function. Defaults to [].
     *
     * See Asynchronous Blur Validation Example for more details.
     */
    asyncBlurFields?: string[];

    /**
     * a function that takes all the form values, the dispatch function, and
     * the props given to your component, and returns a Promise that will
     * resolve if the validation is passed, or will reject with an object of
     * validation errors in the form { field1: <String>, field2: <String> }.
     *
     * See Asynchronous Blur Validation Example for more details.
     */
    asyncValidate?(values: TValues, dispatch: Dispatch<any>, props: Object): Promise<any>;

    /**
     * Whether or not to automatically destroy your form's state in the Redux
     * store when your component is unmounted. Defaults to true.
     */
    destroyOnUnmount?: boolean;

    /**
     * The key for your sub-form.
     *
     * See Multirecord Example for more details.
     */
    formKey?: string;

    /**
     * A function that takes the entire Redux state and the reduxMountPoint
     * (which defaults to "form"). It defaults to:
     * (state, reduxMountPoint) => state[reduxMountPoint].
     * The only reason you should provide this is if you are keeping your Redux
     * state as something other than plain javascript objects, e.g. an
     * Immutable.Map.
     */
    getFormState?(state: any, reduxMountPoint: string): any;

    /**
     * The values with which to initialize your form in componentWillMount().
     * Particularly useful when Editing Multiple Records, but can also be used
     * with single-record forms. The values should be in the form
     * { field1: 'value1', field2: 'value2' }.
     */
    initialValues?: { [field: string]: FieldValue };

    /**
     * The function to call with the form data when the handleSubmit() is fired
     * from within the form component. If you do not specify it as a prop here,
     * you must pass it as a parameter to handleSubmit() inside your form
     * component.
     */
    onSubmit?(values: TValues, dispatch?: Dispatch<any>): any;

    /**
     * If true, the form values will be overwritten whenever the initialValues
     * prop changes. If false, the values will not be overwritten if the form has
     * previously been initialized. Defaults to true.
     */
    overwriteOnInitialValuesChange?: boolean;

    /**
     * If specified, all the props normally passed into your decorated
     * component directly will be passed under the key specified. Useful if
     * using other decorator libraries on the same component to avoid prop
     * namespace collisions.
     */
    propNamespace?: string;

    /**
     * if true, the decorated component will not be passed any of the onX
     * functions as props that will allow it to mutate the state. Useful for
     * decorating another component that is not your form, but that needs to
     * know about the state of your form.
     */
    readonly?: boolean;

    /**
     * The use of this property is highly discouraged, but if you absolutely
     * need to mount your redux-form reducer at somewhere other than form in
     * your Redux state, you will need to specify the key you mounted it under
     * with this property. Defaults to 'form'.
     *
     * See Alternate Mount Point Example for more details.
     */
    reduxMountPoint?: string;

    /**
     * If set to true, a failed submit will return a rejected promise. Defaults
     * to false. Only use this if you need to detect submit failures and run
     * some code when a submit fails.
     */
    returnRejectedSubmitPromise?: boolean;

    /**
     * marks fields as touched when the blur action is fired. Defaults to true.
     */
    touchOnBlur?: boolean;

    /**
     * marks fields as touched when the change action is fired. Defaults to
     * false.
     */
    touchOnChange?: boolean;

    /**
     * a synchronous validation function that takes the form values and props
     * passed into your component. If validation passes, it should return {}.
     * If validation fails, it should return the validation errors in the form
     * { field1: <String>, field2: <String> }.
     * Defaults to (values, props) => ({}).
     */
    validate?(values: TValues, props: TOwnProps): Object;

    /**
     * a synchronous warning function that takes the form values and props passed
     * into your component. Warnings work the same as validations, but do not mark
     * a form as invalid. If the warning check passes, it should return {}. If
     * the check fails, it should return the warnings in the form { field1: <String>,
     * field2: <String> }. Defaults to (values, props) => ({}).
     */
    warn?(values: TValues, props: TOwnProps): Object;
}

/**
 * @param value The current value of the field.
 * @param previousValue The previous value of the field before the current
 * action was dispatched.
 * @param allValues All the values of the current form.
 * @param previousAllValues All the values of the form before the current
 * change. Useful to change one field based on a change in another.
 */
export type Normalizer<TValues> =
    (value: FieldValue, previousValue: FieldValue,
        allValues: TValues, previousAllValues: TValues) => any;

export const reducer: {
    (state: any, action: any): any;

    /**
     * Returns a form reducer that will also pass each form value through the
     * normalizing functions provided. The parameter is an object mapping from
     * formName to an object mapping from fieldName to a normalizer function.
     * The normalizer function is given four parameters and expected to return
     * the normalized value of the field.
     */
    normalize<TValues>(normalizers: {
        [formName: string]: {
            [P in keyof TValues]: Normalizer<TValues>
        }
    }): Reducer<any>;

    /**
     * Returns a form reducer that will also pass each action through
     * additional reducers specified. The parameter should be an object mapping
     * from formName to a (state, action) => nextState reducer. The state
     * passed to each reducer will only be the slice that pertains to that
     * form.
     */
    plugin(reducers: { [formName: string]: Reducer<any> }): Reducer<any>;
}

// export class Field<Values, Props> extends React.Component<FieldProps<Values, Props>, any> {}
export class Field extends React.Component<any, any> {}

export interface FieldArrayProps {
  /**
   * A string path, in dot-and-bracket notation, corresponding to a value in
   * the form values. It may be as simple as 'firstName' or as complicated as
   * contact.billing.address[2].phones[1].areaCode.
   */
  name: string;
  /**
   * A Component or stateless function to render the field array.
   */
  component: React.Component<any, any>;
  withRef?: boolean;
}

export class FieldArray extends React.Component<any, any> {}

export type selector = (state: Object, ...field: string[]) => any;

export function formValueSelector(form: string, getFormState?: Function): selector;

}
