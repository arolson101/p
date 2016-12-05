import * as RI from 'react-intl'
import { DbInfo, Institution, Account } from '../../docs'
import * as RR from 'react-router'
import { Location, History } from 'history'

// the .d.ts declares these as optional
interface InjectedIntlProps {
  formatDate: (date: Date, options: RI.FormattedDate.PropsBase) => string;
  formatTime: (date: Date, option?: RI.FormattedTime.PropsBase) => string;
  formatRelative: (value: number,options?: RI.FormattedRelative.PropsBase) => string;
  formatNumber: (value: number, options?: RI.FormattedNumber.PropsBase) => string;
  formatPlural: (value: number, options?: RI.FormattedPlural.PropsBase) => string;
  formatMessage: (messageDescriptor: RI.FormattedMessage.MessageDescriptor, values?: Object) => string;
  formatHTMLMessage: (messageDescriptor: RI.FormattedMessage.MessageDescriptor, values?: Object) => string;
}

export interface IntlProps {
  intl: InjectedIntlProps
}

interface Params {
  db: DbInfo.Id
  institution: Institution.Id
  account: Account.Id
}

interface RouteComponentProps<P, R> {
  history: History
  location: Location
  params: P
  route: RR.PlainRoute
  routeParams: R
  routes: RR.PlainRoute[]
  children?: React.ReactElement<any>
}

export type RouteProps = RouteComponentProps<Params, any>
