import * as docURI from 'docuri';
import { Dispatch, Action } from 'redux';
import ReduxThunk from 'redux-thunk';
import { DbSlice } from "./db";
import { AccountDoc, account_id } from "./account";

export interface Transaction {
	time: Date;
	payee: string;
	amount: number;
}



export const transaction_id = docURI.route<{institution: string, account: string, time: string}>("transaction/:institution/:account/:time");
export type TransactionDoc = PouchDB.Core.Document<Transaction>;

export const transactionDoc = (account: AccountDoc, transaction: Transaction): TransactionDoc => {
  const aroute = account_id(account._id);
  if (!aroute) throw new Error("invalid account id: " + account._id);
	const time = transaction.time.valueOf().toString();
	const info = Object.assign({}, aroute, { time });
  const _id = transaction_id(info);
	return Object.assign({ _id }, transaction);
}

export const transactionsForAccount = (db: PouchDB.Database<{}>, account: string, start: Date, end: Date): Promise<AccountDoc[]> => {
  const aroute = account_id(account);
  if (!aroute) throw new Error("invalid account id: " + account);
  const startkey = transaction_id(Object.assign({ time: start.valueOf().toString() }, aroute));
  const endkey = transaction_id(Object.assign({ time: end.valueOf().toString() }, aroute));
  return db.allDocs({startkey, endkey});
}
