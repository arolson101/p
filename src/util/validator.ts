import * as moment from 'moment'
import * as numeral from 'numeral'
import { SubmissionError, ErrorsFor, FieldArrayErrors } from 'redux-form'

export class Validator<V> {
  values: V
  errors: ErrorsFor<V>

  constructor (values: V, errors: ErrorsFor<V> = {} as any) {
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
    const value: string = this.values[key] as any
    if (value && values.findIndex(x => roughlyEqual(x, value)) !== -1) {
      if (!this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  date (key: keyof V, message: string) {
    const strValue = this.values[key] as any
    const value = moment(strValue, 'L')
    if (strValue && !value.isValid() && !this.errors[key]) {
      this.errors[key] = message
    }
  }

  numeral (key: keyof V, message: string) {
    const strValue = this.values[key] as any
    const value = numeral(strValue)
    const x = value.value()
    if (x === null || isNaN(x)) {
      this.errors[key] = message
    }
  }

  array (key: keyof V, message: string) {
    const arrValue = this.values[key] as any as any[]
    if (!arrValue || !arrValue.length) {
      this.errors[key] = { _error: message }
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
            this.errors[key] = []
          }
          const errArray = this.errors[key] as FieldArrayErrors
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
    const memberErrors = this.errors[key] as any[]
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
