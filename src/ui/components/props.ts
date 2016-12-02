import { InjectedIntlProps } from 'react-intl'
import { DbInfo, Institution, Account } from '../../docs'
import { Router } from 'react-router'

export interface IntlProps {
  intl: InjectedIntlProps
}

interface Params {
  db: DbInfo.Id
  institution: Institution.Id
  account: Account.Id
}

export type RouteProps = Router.RouteComponentProps<Params, any>
