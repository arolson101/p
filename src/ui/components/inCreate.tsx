import { FinancialInstitution } from 'filist'
import * as React from 'react'
import * as R from 'ramda'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { createSelector } from 'reselect'
import { Institution } from '../../docs'
import { AppState, AppDispatch, historyAPI, emptyfi, CurrentDb } from '../../state'
import { Validator, formatAddress } from '../../util'
import { typedFields, forms } from './forms'
import { IntlProps, RouteProps } from './props'

const messages = defineMessages({
  fi: {
    id: 'inCreate.fi',
    defaultMessage: 'Institution'
  },
  name: {
    id: 'inCreate.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'inCreate.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'inCreate.address',
    defaultMessage: 'Address'
  }
})

interface Option {
  value: number
  label: string
}

interface ConnectedProps {
  options: Option[]
  filist: FinancialInstitution[]
  current: CurrentDb
  // institution?: Institution
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & RouteProps & ReduxFormProps<Values>

interface Values extends Institution {
  fi: string
}

const { TextField, SelectField, MultilineTextField } = typedFields<Values>()

export const InCreateComponent = (props: AllProps) => {
  const { handleSubmit, intl: { formatMessage }, options } = props
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <SelectField
            autofocus
            name='fi'
            label={formatMessage(messages.fi)}
            options={options}
            onChange={(value: number) => onChangeFI(props, value)}
          />
        </div>
        <div>
          <TextField
            name='name'
            label={formatMessage(messages.name)}
          />
        </div>
        <div>
          <TextField
            name='web'
            label={formatMessage(messages.web)}
          />
        </div>
        <div>
          <MultilineTextField
            name='address'
            rows={4}
            label={formatMessage(messages.address)}
          />
        </div>
        <div>
          <ButtonToolbar>
            <Button
              type='button'
              onClick={() => historyAPI.go(-1)}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button
              type='submit'
              bsStyle='primary'
            >
              <FormattedMessage {...forms.create}/>
            </Button>
          </ButtonToolbar>
        </div>
      </form>
    </div>
  )
}

const onChangeFI = (props: AllProps, index?: number) => {
  const { filist } = props
  const value = index ? filist[index - 1] : emptyfi

  props.change('name', value.name)
  props.change('web', value.profile.siteURL)
  props.change('address', formatAddress(value))
}

const optionsSelector = createSelector(
  (state: AppState) => state.fi.list,
  (filist): Option[] => filist.map((fi, index) => ({ value: index + 1, label: fi.name }))
)

// const institutionSelector = createSelector(
//   (state: AppState, props: AllProps) => props.params.institution,
//   (state: AppState) => state.db.current && state.db.current.cache,
//   (institution, cache) => cache && cache.institutions.get(Institution.docId({institution}))
// )

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current } = props
  const { fi, ...vals } = values
  const doc = Institution.doc(vals)
  await current.db.put(doc)

  props.router.replace(Institution.path(props.params.db, doc))
}

export const InCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      options: optionsSelector(state),
      filist: state.fi.list,
      current: state.db.current!,
      // institution: institutionSelector(state)
    }),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps, Values>({
    form: 'InCreate'
  })
)(InCreateComponent) as React.ComponentClass<Props>
