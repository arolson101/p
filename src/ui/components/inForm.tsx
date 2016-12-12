import autobind = require('autobind-decorator')
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { ReduxFormProps } from 'redux-form'
import { Institution } from '../../docs'
import { FI, emptyfi, CurrentDb } from '../../state'
import { formatAddress } from '../../util'
import { typedFields } from './forms'
import { IntlProps } from './props'

const messages = defineMessages({
  fi: {
    id: 'inForm.fi',
    defaultMessage: 'Institution'
  },
  name: {
    id: 'inForm.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'inForm.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'inForm.address',
    defaultMessage: 'Address'
  }
})

interface Props {
  filist: FI[]
  current: CurrentDb
  lang: string
  institution?: Institution
}

type AllProps = IntlProps & Props & ReduxFormProps<Values>

export interface Values {
  fi: string

  name: string
  web: string
  address: string
  notes: string

  online: boolean

  fid: string
  org: string
  ofx: string

  username: string
  password: string
}

const { TextField, SelectField, MultilineTextField } = typedFields<Values>()

export class InForm extends React.Component<AllProps, any> {
  componentWillMount() {
    this.initializeValues(this.props)
  }

  compontWillReceiveProps(nextProps: AllProps) {
    if (this.props.institution !== nextProps.institution) {
      this.initializeValues(nextProps)
    }
  }

  initializeValues(props: AllProps) {
    const { institution, initialize, filist } = props
    if (institution) {
      const fi = filist.findIndex(fi => fi.name === institution.name) + 1
      const values = institution ? { ...institution, fi } : {}
      initialize(values)
    } else {
      initialize({})
    }
  }

  render() {
    const { intl: { formatMessage }, filist } = this.props
    return (
      <div>
        <div>
          <SelectField
            autofocus
            name='fi'
            label={formatMessage(messages.fi)}
            options={filist}
            labelKey='name'
            valueKey='id'
            onChange={this.onChangeFI}
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
      </div>
    )
  }

  @autobind
  onChangeFI(index: number) {
    const { filist, change } = this.props
    const value = index ? filist[index - 1] : emptyfi

    change('name', value.name)
    change('web', value.profile.siteURL)
    change('address', formatAddress(value))
  }
}
