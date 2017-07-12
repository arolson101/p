
export interface DialogState {
  dialog: string
  show: boolean
  props: any
}

const defaultState = {
  dialog: '',
  show: false,
  props: {}
}

const SET_DIALOG = 'dialog/SET_DIALOG'

interface SetDialogAction {
  type: typeof SET_DIALOG,
  dialog: string,
  props: any
}

export const setDialog = (dialog: string, props: any): SetDialogAction => ({
  type: SET_DIALOG,
  dialog,
  props
})

const CLOSE_DIALOG = 'dialog/CLOSE_DIALOG'

interface CloseDialogAction {
  type: typeof CLOSE_DIALOG
}

export const closeDialog = (): CloseDialogAction => ({
  type: CLOSE_DIALOG
})

type Actions = SetDialogAction | CloseDialogAction | { type: '' }

const reducer = (state: DialogState = defaultState, action: Actions): DialogState => {
  switch (action.type) {
    case SET_DIALOG:
      return { ...state, show: true, dialog: action.dialog, props: action.props }
    case CLOSE_DIALOG:
      return { ...state, show: false }
    default:
      return state
  }
}

export interface DialogSlice {
  dialog: DialogState
}

export const DialogSlice = {
  dialog: reducer
}
