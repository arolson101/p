import { defineMessages } from 'react-intl'

const translations = defineMessages({
  password: {
    id: 'password',
    defaultMessage: 'Password'
  },
  confirmPassword: {
    id: 'confirmPassword',
    defaultMessage: 'Confirm Password'
  },
  cancel: {
    id: 'cancel',
    defaultMessage: 'Cancel'
  },
  create: {
    id: 'create',
    defaultMessage: 'Create'
  },
  login: {
    id: 'login',
    defaultMessage: 'Login'
  },
  required: {
    id: 'required',
    defaultMessage: 'Required'
  },
  passwordsMatch: {
    id: 'passwordsMatch',
    defaultMessage: 'Passwords must match'
  }
})

export const forms = {
  translations
}
