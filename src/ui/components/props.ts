import * as RI from 'react-intl'
import * as RR from 'react-router'

export type FormatMessageFcn = (messageDescriptor: RI.FormattedMessage.MessageDescriptor, values?: Object) => string

export interface IntlProps {
  intl: RI.InjectedIntl
}

export type RouteProps<Params> = RR.RouteComponentProps<Params>
