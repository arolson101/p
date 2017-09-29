import * as moment from 'moment'
import * as numeral from 'numeral'
import { FormAPI, FormState } from 'react-form'
import { defineMessages, InjectedIntl, FormattedMessage } from 'react-intl'
import { SubmissionError, FormErrors } from 'redux-form'

type DataShape = {}

const messages = defineMessages({
  required: {
    id: 'validator.required',
    defaultMessage: 'Required'
  },
  invalidDate: {
    id: 'validator.invalidDate',
    defaultMessage: 'Invalid date'
  },
  invalidNumber: {
    id: 'validator.invalidNumber',
    defaultMessage: 'Invalid number'
  },
})

let injectedIntl: InjectedIntl
type FormatMessage = typeof injectedIntl.formatMessage

class ErrorWrapper extends Error {
  errors: any

  constructor (errors: any) {
    super()
    this.errors = errors
  }
}

export class Validator<V extends DataShape> {
  values: V
  formatMessage: FormatMessage
  errors: any // FormErrors<V>

  constructor (values: V, formatMessage: FormatMessage, errors: FormErrors<V> = {}) {
    this.values = values
    this.formatMessage = formatMessage
    this.errors = errors
  }

  static setErrors (err: Error, state: FormState, instance: FormAPI) {
    if (err instanceof ErrorWrapper) {
      state.errors = err.errors
      instance.setAllTouched()
    } else {
      console.error(err)
    }
  }

  get hasErrors () {
    return !isEmpty(this.errors)
  }

  maybeThrowSubmissionError () {
    if (this.hasErrors) {
      throw new ErrorWrapper(this.errors)
    }
  }

  required<K extends keyof V> (...keys: K[]) {
    for (let key of keys) {
      if (!this.values[key] && !this.errors[key]) {
        this.errors[key] = this.formatMessage(messages.required)
      }
    }
  }

  equal (key: keyof V, otherKey: keyof V, message: FormattedMessage.MessageDescriptor) {
    if (this.values[key] && this.values[otherKey] && this.values[key] !== this.values[otherKey]) {
      if (!this.errors[key]) {
        this.errors[key] = this.formatMessage(message)
      }
    }
  }

  unique (key: keyof V, values: string[], message: FormattedMessage.MessageDescriptor) {
    const value: string = this.values[key]
    if (value && values.findIndex(x => roughlyEqual(x, value)) !== -1) {
      if (!this.errors[key]) {
        this.errors[key] = this.formatMessage(message)
      }
    }
  }

  date (key: keyof V) {
    const strValue = this.values[key]
    const value = moment(strValue, 'L')
    if (strValue && !value.isValid() && !this.errors[key]) {
      this.errors[key] = this.formatMessage(messages.invalidDate)
    }
  }

  numeral (key: keyof V) {
    const strValue = this.values[key]
    const value = numeral(strValue)
    const x = value.value()
    if (x === null || isNaN(x)) {
      this.errors[key] = this.formatMessage(messages.invalidNumber)
    }
  }

  arrayUnique<K extends keyof V> (key: K, subkey: string, message: FormattedMessage.MessageDescriptor) {
    const array = this.values[key] as any as V[K][]
    if (array) {
      const selectedValues = array.filter(value => value).map(value => (value as any)[subkey])
      for (let i = 0; i < array.length; i++) {
        const value = selectedValues[i]
        const otherIdx = selectedValues.findIndex(
          (otherValue, idx) => (i !== idx && roughlyEqual(value, otherValue))
        )
        if (otherIdx !== -1) {
          if (!this.errors[key]) {
            this.errors[key] = [] as any
          }
          const errArray = this.errors[key] as any as any[]
          if (!(i in errArray)) {
            errArray[i] = {}
          }
          errArray[i][subkey] = this.formatMessage(message, {[subkey]: value})
        }
      }
    }
  }

  arraySubvalidator<Sub> (key: keyof V, i: number) {
    const values = this.values[key] as any as any[] || []
    if (!this.errors[key]) {
      this.errors[key] = {} as any
    }
    const memberErrors = this.errors[key] as any as any[]
    if (!memberErrors[i]) {
      memberErrors[i] = {}
    }
    return new Validator<Sub>(values[i] || {}, this.formatMessage, memberErrors[i])
  }
}

const isEmpty = (obj: any) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (!isEmpty(obj[i])) {
        return false
      }
    }
    return true
  } else if (typeof obj === 'object') {
    for (let key in obj) {
      if (!isEmpty(obj[key])) {
        return false
      }
    }
    return true
  }

  return false
}

const roughlyEqual = (a: any, b: any): boolean => {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.toLocaleLowerCase() === b.toLocaleLowerCase()
  } else {
    return a === b
  }
}
