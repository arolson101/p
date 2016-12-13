import autobind = require('autobind-decorator')
import * as React from 'react'
import Loading from 'react-loading-bar'
import { Grid, Alert, Button, SplitButton, ButtonToolbar, MenuItem } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { ConfirmDelete } from './confirmDelete'
import { Breadcrumbs } from './breadcrumbs'
import { forms } from './forms'
import { Values, InForm } from './inForm'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectInstitution } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inUpdate.page',
    defaultMessage: 'Edit'
  },
  deleteIn: {
    id: 'inUpdate.deleteIn',
    defaultMessage: 'Delete Institution'
  },
  confirmDeleteTitle: {
    id: 'inUpdate.confirmDeleteTitle',
    defaultMessage: 'Confirm Delete'
  },
  confirmDeleteBody: {
    id: 'inUpdate.confirmDeleteBody',
    defaultMessage: "This will delete institution '{name}' and all {count} accounts.  Are you sure?"
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

interface State {
  error?: string
  deleting?: boolean
}

interface Deletion {
  _id: string
  _rev?: string
  _deleted: true
}

export class InUpdateComponent extends React.Component<AllProps, State> {
  state: State = {
    error: undefined,
    deleting: false
  }

  render() {
    const { handleSubmit, router, institution } = this.props
    const { formatMessage } = this.props.intl
    const { error, deleting } = this.state
    const color = institution ? 'red' : 'blue'
    return (
      <div>
        <Loading color={color} show={!institution || deleting}/>
        {institution &&
          <Grid>
            <Breadcrumbs {...this.props} page={formatMessage(messages.page)}/>
            <form onSubmit={handleSubmit(submit)}>
              <InForm {...this.props} />
              {error &&
                <Alert bsStyle='danger'>
                  {error}
                </Alert>
              }
              <div>
                <ButtonToolbar className='pull-right'>
                  <Button
                    type='button'
                    onClick={() => router.goBack()}
                    disabled={deleting}
                  >
                    <FormattedMessage {...forms.cancel}/>
                  </Button>
                  <SplitButton
                    type='submit'
                    bsStyle='primary'
                    id='open-dropdown'
                    title={formatMessage(forms.save)}
                    disabled={deleting}
                    pullRight
                  >
                    <ConfirmDelete
                      component={MenuItem}
                      event='onSelect'
                      title={formatMessage(messages.confirmDeleteTitle)}
                      body={formatMessage(messages.confirmDeleteBody, {name: institution!.name, count: institution!.accounts.length})}
                      confirm={formatMessage(messages.deleteIn)}
                      onConfirmed={this.inDelete}
                    >
                      <FormattedMessage {...messages.deleteIn}/>
                    </ConfirmDelete>
                  </SplitButton>
                </ButtonToolbar>
              </div>
            </form>
          </Grid>
        }
      </div>
    )
  }

  @autobind
  async inDelete() {
    const { dbInfo, current, institution, router } = this.props
    if (!institution || !current) { throw new Error('no institution or db') }
    try {
      this.setState({deleting: true, error: undefined})
      let deletions: Deletion[] = []
      for (let accountid of institution.accounts) {
        const account = current.cache.accounts.get(accountid)
        if (account) {
          deletions.push({
            _id: account._id,
            _rev: account._rev,
            _deleted: true
          })
        }
        // TODO: delete transactions
      }
      deletions.push({
        _id: institution._id,
        _rev: institution._rev,
        _deleted: true
      })
      await current.db.bulkDocs(deletions)
      this.setState(
        {deleting: false},
        () => router.replace(DbInfo.to.read(dbInfo!))
      )
    } catch (err) {
      this.setState({deleting: false, error: err.message})
    }
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
