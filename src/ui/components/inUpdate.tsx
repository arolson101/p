import * as React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Institution } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { forms } from './forms'
import { Values, InForm } from './inForm'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectInstitution } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inUpdate.page',
    defaultMessage: 'Edit'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  lang: string
  dbInfo?: DbInfo.Doc
  institution?: Institution.Doc
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & RouteProps<Institution.Params> & ReduxFormProps<Values>

export const InUpdateComponent = (props: AllProps) => {
  const { handleSubmit } = props
  const { formatMessage } = props.intl
  return (
    <div>
      <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
      <form onSubmit={handleSubmit(submit)}>
        <InForm {...props} />
        <div>
          <ButtonToolbar>
            <Button
              type='button'
              onClick={() => props.router.goBack()}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button
              type='submit'
              bsStyle='primary'
            >
              <FormattedMessage {...forms.save}/>
            </Button>
          </ButtonToolbar>
        </div>
      </form>
    </div>
  )
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current, filist } = props
  const doc: Institution.Doc = {
    ...props.institution,

    fi: values.fi ? filist[values.fi - 1].name : undefined,
    name: values.name,
    web: values.web,
    address: values.address,
    online: values.online,
    fid: values.fid,
    org: values.org,
    ofx: values.ofx,
    login: {
      username: values.username,
      password: values.password
    }
  }
  await current.db.put(doc)

  props.router.replace(Institution.to.read(doc))
}

export const InUpdate = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Institution.Params>): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'InUpdate'
  })
)(InUpdateComponent) as React.ComponentClass<Props>
