import * as PouchDB from "pouchdb-browser";

import * as PouchFind from 'pouchdb-find';
import * as CryptoPouch from 'crypto-pouch';
//import * as replication from "pouchdb-replication";
//import * as express from 'express';


PouchDB.plugin(PouchFind);
PouchDB.plugin(CryptoPouch);

// import * as express_pouchdb from 'express-pouchdb';
// var appx = express_pouchdb({
// 	mode: 'minimumForPouchDB',
//   overrideMode: {
//     include: ['routes/fauxton']
//   }
// });
// appx.setPouchDB(PouchDB);
// appx.listen(3000);
// var appx = express_pouchdb({
//   mode: 'minimumForPouchDB',
//   overrideMode: {
//     include: ['routes/fauxton']
//   }
// });
// when not specifying PouchDB as an argument to the main function, you
// need to specify it like this before requests are routed to ``app``
//appx.setPouchDB(PouchDB);

var db = new PouchDB("foo");
db.crypto("password");

// export function main() {
// 	console.log("main");
// }

// var remote = new PouchDB('http://localhost:5984/foo');
// (db as any).replicate.to(remote);
//PouchDB.replicate('foo', 'http://localhost:5984/foo', {live: true});

function addTodo(text: string): Promise<any> {
	var todo = {
		_id: new Date().toISOString(),
		title: text,
		completed: false
	};
	return db.put(todo);
}


async function test() {
	// await db.createIndex({
	// 	index: {
	// 		fields: ['title']
	// 	}
	// });

	// var docs = await db.find({
	// 	selector: {
	// 		$and: [
	// 			//{ _id: { $gt: 100 } },
	// 			{ title: { $lt: "todo100" } },
	// 			//{ completed: { $eq: false } },
	// 		]
	// 	}
	// });

	//console.log(docs);
}


async function addLots() {
	console.log("starting to add lots");
	for(var i=0; i<1000000; i++)
		await addTodo("todo" + i);
	console.log("done");
}


//new Promise(resolve => addLots());
new Promise(() => test());


interface Action {
	type: string;
}


const verify = (stmt: any, message?: string) => {
	if(!stmt) {
		throw new Error(message);
	}
}

//interface AppState extends TodosState, UsersState {}
//type AppState = TodosState & UsersState;

//let app: AppState;

