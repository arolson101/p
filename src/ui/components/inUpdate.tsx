import * as React from 'react'
import { Grid, Col, Button, ButtonToolbar } from 'react-bootstrap'
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

export class InUpdateComponent extends React.Component<AllProps, any> {
  render() {
    const { handleSubmit, router, institution } = this.props
    const { formatMessage } = this.props.intl
    return (
      <div>
        {institution &&
          <Grid>
            <Breadcrumbs {...this.props} page={formatMessage(messages.page)}/>
            <form onSubmit={handleSubmit(submit)}>
              <InForm {...this.props} />
              <Col>
                <ButtonToolbar className='pull-right'>
                  <Button
                    type='button'
                    onClick={() => router.goBack()}
                  >
                    <FormattedMessage {...forms.cancel}/>
                  </Button>
                  <Button
                    type='submit'
                    bsStyle='primary'
                    id='open-dropdown'
                  >
                  <FormattedMessage {...forms.save}/>
                  </Button>
                </ButtonToolbar>
              </Col>
            </form>
          </Grid>
        }
      </div>
    )
  }
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { institution, current, filist, router } = props
  const doc: Institution.Doc = {
    ...institution,

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

  router.replace(Institution.to.read(doc))
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
