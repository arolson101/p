import { addLocaleData } from 'react-intl'
import * as en from 'react-intl/locale-data/en'

addLocaleData(en)

export interface I18nState {
  locale: string
  lang: string // ISO 639-1
}

const defaultState = {
  locale: 'en',
  lang: 'en'
}

type SET_LOCALE = 'i18n/SET_LOCALE'
const SET_LOCALE = 'i18n/SET_LOCALE'

interface SetLocaleAction {
  type: SET_LOCALE,
  locale: string,
  lang: string
}

export const SetLocale = (locale: string, lang: string): SetLocaleAction => ({
  type: SET_LOCALE,
  locale,
  lang
})

type Actions = SetLocaleAction | { type: '' }

const reducer = (state: I18nState = defaultState, action: Actions): I18nState => {
  switch (action.type) {
    case SET_LOCALE:
      return { ...state, locale: action.locale, lang: action.lang }
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
