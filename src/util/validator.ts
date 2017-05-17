import * as moment from 'moment'
import * as numeral from 'numeral'
import { defineMessages, InjectedIntl, FormattedMessage } from 'react-intl'
import { SubmissionError, FormErrors, DataShape } from 'redux-form'

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

export class Validator2<V extends DataShape> {
  values: V
  formatMessage: FormatMessage
  errors: FormErrors<V>

  constructor (values: V, formatMessage: FormatMessage, errors: FormErrors<V> = {}) {
    this.values = values
    this.formatMessage = formatMessage
    this.errors = errors
  }

  maybeThrowSubmissionError () {
    if (!isEmpty(this.errors)) {
      throw new SubmissionError<V>(this.errors)
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
          errArray[i][subkey] = this.formatMessage(message)
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
    return new Validator2<Sub>(values[i] || {}, this.formatMessage, memberErrors[i])
  }
}

export class Validator<V extends DataShape> {
  values: V
  errors: FormErrors<V>

  constructor (values: V, errors: FormErrors<V> = {}) {
    this.values = values
    this.errors = errors
  }

  maybeThrowSubmissionError () {
    if (!isEmpty(this.errors)) {
      throw new SubmissionError<V>(this.errors)
    }
  }

  required<K extends keyof V> (keys: K[], message: string) {
    for (let key of keys) {
      if (!this.values[key] && !this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  equal (key: keyof V, otherKey: keyof V, message: string) {
    if (this.values[key] && this.values[otherKey] && this.values[key] !== this.values[otherKey]) {
      if (!this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  unique (key: keyof V, values: string[], message: string) {
    const value: string = this.values[key]
    if (value && values.findIndex(x => roughlyEqual(x, value)) !== -1) {
      if (!this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  date (key: keyof V, message: string) {
    const strValue = this.values[key]
    const value = moment(strValue, 'L')
    if (strValue && !value.isValid() && !this.errors[key]) {
      this.errors[key] = message
    }
  }

  numeral (key: keyof V, message: string) {
    const strValue = this.values[key]
    const value = numeral(strValue)
    const x = value.value()
    if (x === null || isNaN(x)) {
      this.errors[key] = message
    }
  }

  array (key: keyof V, message: string) {
    const arrValue = this.values[key] as any[]
    if (!arrValue || !arrValue.length) {
      this.errors[key] = { _error: message } as any
    }
  }

  arrayUnique<K extends keyof V> (key: K, subkey: string, message: string) {
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
          errArray[i][subkey] = message
        }
      }
    }
  }

  arraySubvalidator (key: keyof V, i: number): Validator<any> {
    const values = this.values[key] as any as any[] || []
    if (!this.errors[key]) {
      this.errors[key] = {} as any
    }
    const memberErrors = this.errors[key] as any as any[]
    if (!memberErrors[i]) {
      memberErrors[i] = {}
    }
    return new Validator<any>(values[i] || {}, memberErrors[i])
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
