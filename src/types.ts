import * as docURI from "docuri";

type Document<T> = PouchDB.Core.Document<T>;


export interface Institution {
	name: string;
	web?: string;
	address?: string;
	notes?: string;

	online?: boolean;

	fid?: string;
	org?: string;
	ofx?: string;

	login?: {
		username: string;
		password: string;
	}
}


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


export interface Transaction {
	time: Date;
	payee: string;
	amount: number;
}


const InstitutionRoute = docURI.route<{institution: string}>("institution/:institution");
const AccountRoute = docURI.route<{institution: string, account: string}>("account/:institution/:account");
const TransactionRoute = docURI.route<{institution: string, account: string, time: string}>("transaction/:institution/:account/:time");


export type TransactionDoc = Document<Transaction>;
export const InstitutionDoc = (institution: Institution): InstitutionDoc => {
  const _id = InstitutionRoute({ institution: institution.name });
	return Object.assign({ _id }, institution);
};


export type AccountDoc = Document<Account>;
export const AccountDoc = (institution: InstitutionDoc, account: Account): AccountDoc => {
  const iroute = InstitutionRoute(institution._id);
  if (!iroute) throw new Error("invalid institution id: " + institution._id);
	const info = Object.assign({}, iroute, { account: account.number });
  const _id = AccountRoute(info);
	return Object.assign({ _id }, account);
};


export type InstitutionDoc = Document<Institution>;
export const TransactionDoc = (account: AccountDoc, transaction: Transaction): TransactionDoc => {
  const aroute = AccountRoute(account._id);
  if (!aroute) throw new Error("invalid account id: " + account._id);
	const time = transaction.time.valueOf().toString();
	const info = Object.assign({}, aroute, { time });
  const _id = TransactionRoute(info);
	return Object.assign({ _id }, transaction);
}



const uwcu = InstitutionDoc({
	name: "uwcu",
	web: "http://www.uwcu.org",
	online: true,
	login: {
		username: "asdf",
		password: "fdsa",
	}
});
console.log(uwcu);

const uwcu_checking = AccountDoc(uwcu, {
	name: "uwcu checking",
	type: AccountType.CHECKING,
	number: '12345',
	visible: true,
	balance: 0
});
console.log(uwcu_checking);

const trans = TransactionDoc(uwcu_checking, {
	time: new Date(),
	payee: "Moe's Tavern",
	amount: 123.45
});
console.log(trans);

// db.bulkDocs([uwcu, uwcu_checking, trans]);
