import * as moment from 'moment'
import * as numeral from 'numeral'
import { SubmissionError, ErrorsFor } from 'redux-form'

export class Validator<V> {
  values: V
  errors: ErrorsFor<V>

  constructor(values: V) {
    this.values = values
    this.errors = {} as any
  }

  maybeThrowSubmissionError() {
    if (Object.keys(this.errors).length > 0) {
      throw new SubmissionError<V>(this.errors)
    }
  }

  required<K extends keyof V>(keys: K[], message: string) {
    for (let key of keys) {
      if (!this.values[key] && !this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  equal(key: keyof V, otherKey: keyof V, message: string) {
    if (this.values[key] && this.values[otherKey] && this.values[key] !== this.values[otherKey]) {
      if (!this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  unique(key: keyof V, values: string[], message: string) {
    const value: string = this.values[key] as any
    if (value && values.findIndex(x => x.toLowerCase() === value.toLowerCase()) !== -1) {
      if (!this.errors[key]) {
        this.errors[key] = message
      }
    }
  }

  date(key: keyof V, message: string) {
    const strValue = this.values[key] as any
    const value = moment(strValue, 'L')
    if (strValue && !value.isValid() && !this.errors[key]) {
      this.errors[key] = message
    }
  }

  numeral(key: keyof V, message: string) {
    const strValue = this.values[key] as any
    const value = numeral(strValue)
    const x = value.value()
    if (x === null || isNaN(x)) {
      this.errors[key] = message
    }
  }
}
