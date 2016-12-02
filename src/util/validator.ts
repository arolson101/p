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

  equal<K extends keyof V>(key: K, otherKey: K, message: string) {
    if (this.values[key] && this.values[otherKey] && this.values[key] !== this.values[otherKey]) {
      if (!this.errors[key]) {
        this.errors[key] = message
      }
    }
  }
}
