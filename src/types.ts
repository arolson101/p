import { AccountType, institutionDoc, accountDoc, transactionDoc } from "./modules";


const uwcu = institutionDoc({
	name: "uwcu",
	web: "http://www.uwcu.org",
	online: true,
	login: {
		username: "asdf",
		password: "fdsa",
	}
});
console.log(uwcu);

const uwcu_checking = accountDoc(uwcu, {
	name: "uwcu checking",
	type: AccountType.CHECKING,
	number: '12345',
	visible: true,
	balance: 0
});
console.log(uwcu_checking);

const trans = transactionDoc(uwcu_checking, {
	time: new Date(),
	payee: "Moe's Tavern",
	amount: 123.45
});
console.log(trans);

// db.bulkDocs([uwcu, uwcu_checking, trans]);
