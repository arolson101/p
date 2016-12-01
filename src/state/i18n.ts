import { addLocaleData } from 'react-intl'
import * as en from 'react-intl/locale-data/en'

addLocaleData(en)

export interface I18nState {
  locale: string
}

const defaultState = {
  locale: 'en'
}

type SET_LOCALE = 'i18n/SET_LOCALE'
const SET_LOCALE = 'i18n/SET_LOCALE'

interface SetLocaleAction {
  type: SET_LOCALE,
  locale: string
}

export const SetLocale = (locale: string): SetLocaleAction => ({
  type: SET_LOCALE,
  locale
})

type Actions = SetLocaleAction | { type: '' }

const reducer = (state: I18nState = defaultState, action: Actions): I18nState => {
  switch (action.type) {
    case SET_LOCALE:
      return { ...state, locale: action.locale }
    default:
      return state
  }
}

export interface I18nSlice {
  i18n: I18nState
}

export const I18nSlice = {
  i18n: reducer
}