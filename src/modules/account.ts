import * as docURI from 'docuri';
import { Dispatch, Action } from 'redux';
import ReduxThunk from 'redux-thunk';
import { DbSlice } from "./db";
import { InstitutionDoc, institution_id } from "./institution";


// see ofx4js.domain.data.banking.AccountType
export enum AccountType {
  CHECKING,
  SAVINGS,
  MONEYMRKT,
  CREDITLINE,
  CREDITCARD,
}


export interface Account {
	name: string;
	type: AccountType;
	number: string;
	visible: boolean;
	balance: number;
}


export const account_id = docURI.route<{institution: string, account: string}>("account/:institution/:account");
export type AccountDoc = PouchDB.Core.Document<Account>;

export const accountDoc = (institution: InstitutionDoc, account: Account): AccountDoc => {
  const iroute = institution_id(institution._id);
  if (!iroute) throw new Error("invalid institution id: " + institution._id);
	const info = Object.assign({}, iroute, { account: account.number });
  const _id = account_id(info);
	return Object.assign({ _id }, account);
};

export const allAccountsForInstitution = (db: PouchDB.Database<{}>, institution: string): Promise<AccountDoc[]> => {
  const iroute = institution_id(institution);
  if (!iroute) throw new Error("invalid institution id: " + institution);
  const startkey = account_id({institution: iroute.institution, account: ''});
  const endkey = account_id({institution: iroute.institution, account: '\uffff'});
  return db.allDocs({startkey, endkey});
}