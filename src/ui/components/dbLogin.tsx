import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { Dispatch, compose } from 'redux'
import { reduxForm, Field, ReduxFormProps } from 'redux-form'
import { TextField } from 'redux-form-material-ui'
import { createSelector } from 'reselect'
import { AppState, AppDispatch, MetaDoc, historyAPI, LoadDb } from '../../modules'
import { promisedConnect, Promised } from '../../util'

interface Props {
}

interface RouteProps {
  params: {
    db: string
  }
}

interface AsyncProps {
  dbDoc: MetaDoc
}

interface ConnectedProps extends ReduxFormProps<any> {
}

interface DispatchedProps {
  dispatch: AppDispatch
}

interface IntlProps {
  intl: InjectedIntlProps
}

type AllProps = Props & RouteProps & AsyncProps & ConnectedProps & DispatchedProps & IntlProps

const translations = defineMessages({
  login: {
    id: 'login',
    defaultMessage: 'Enter password for database {db}'
  },
  password: {
    id: 'password',
    defaultMessage: 'Password'
  },
  cancel: {
    id: 'cancel',
    defaultMessage: 'Cancel'
  },
  submit: {
    id: 'submit',
    defaultMessage: 'Create'
  },
  required: {
    id: 'required',
    defaultMessage: 'Required'
  }
})

const style = {
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0'
  },
  button: {
    margin: '16px 32px 16px 0'
  }
}

export const DbLoginComponent = (props: AllProps) => {
  const formatMessage = props.intl.formatMessage!
  if (!props.dbDoc) {
    return null as any as JSX.Element
  }
  const db = props.dbDoc.title
  const { handleSubmit } = props
  return (
    <div>
      <p>{formatMessage(translations.login, {db})}</p>
      <form onSubmit={handleSubmit!(submit)}>
        <div>
          <Field
            name='password'
            type='password'
            autoFocus
            component={TextField}
            hintText={formatMessage(translations.password)}
            floatingLabelText={formatMessage(translations.password)}
          />
        </div>
        <div>
          <RaisedButton
            type='button'
            label={formatMessage(translations.cancel)}
            style={style.button}
            onTouchTap={() => historyAPI.go(-1)}
          />
          <RaisedButton
            type='submit'
            label={formatMessage(translations.submit)}
            style={style.button}
            primary
          />
        </div>
      </form>
    </div>
  )
}

const queryDbDoc = createSelector(
  (state: AppState, props: RouteProps) => state.db.meta!,
  (state: AppState, props: RouteProps) => props.params.db,
  async (meta, db): Promise<MetaDoc> => {
    return await meta.handle.get(db)
  }
)

interface Values {
  name?: string
  password?: string
  confirmPassword?: string

  [key: string]: string | undefined
}

const validate = (values: Values, props: IntlProps) => {
  const formatMessage = props.intl.formatMessage!
  const errors: Values = {}
  const requiredFields = [ 'password' ]
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = formatMessage(translations.required)
    }
  })
  return errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { dbDoc } = props
  dispatch(LoadDb(dbDoc!._id, dbDoc!.title, values.password!))
}

export const DbLogin = compose(
  injectIntl,
  promisedConnect(
    (state: AppState, props: RouteProps): Promised<AsyncProps> => ({
      dbDoc: queryDbDoc(state, props),
    })
  ) as any,
  reduxForm(
    {
      form: 'DbLogin',
      validate,
      // destroyOnUnmount: !(module as any).hot
    },
    // (state: AppState): ConnectedProps => ({}),
    // (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  )
)(DbLoginComponent) as React.ComponentClass<Props>
