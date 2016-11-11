import * as docURI from 'docuri';
import { Dispatch, Action } from 'redux';
import ReduxThunk from 'redux-thunk';
import { DbSlice } from "./db";
import { AccountDoc, allAccountsForInstitution } from "./account";


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


export const institution_id = docURI.route<{institution: string}>("institution/:institution");
export type InstitutionDoc = PouchDB.Core.Document<Institution>;
export function institutionDoc(institution: Institution): InstitutionDoc {
  const _id = institution_id({ institution: institution.name });
	return Object.assign({ _id }, institution);
};


export interface InstitutionState {
  current: InstitutionDoc | undefined;
  accounts: AccountDoc[];
}

const initialState: InstitutionState = {
  current: undefined,
  accounts: []
};



const SET_INSTITUTION = 'institution/set';
type SET_INSTITUTION = 'institution/set';

interface SetAction {
  type: SET_INSTITUTION;
  current: InstitutionDoc;
  accounts: AccountDoc[];
}


export function loadInstitution(this: void, id: string) {
  return async function(dispatch: Dispatch<{}>, getState: () => InstitutionSlice & DbSlice) {
    const { db } = getState();
    if (!db.current) throw new Error("no current db");
    const current = await db.current.get(id) as InstitutionDoc;
    const accounts = await allAccountsForInstitution(db.current, id);
    dispatch(<SetAction>{
      type: SET_INSTITUTION,
      current,
      accounts
    });
  }
}


export function reloadInstitution(this: void) {
  return async function(dispatch: Dispatch<{}>, getState: () => InstitutionSlice & DbSlice) {
    const { institution } = getState();
    if (institution.current) {
      return loadInstitution(institution.current._id);
    }
  }
}


type NullAction = { type: '' }

function institution(state: InstitutionState = initialState, action: SetAction | NullAction): InstitutionState {
  switch (action.type) {
    case (SET_INSTITUTION as SET_INSTITUTION):
      return Object.assign({}, state, <InstitutionState>{ current: action.current, accounts: action.accounts });

    default:
      return state;
  }
}


export interface InstitutionSlice {
  institution: InstitutionState;
}

export const InstitutionSlice = {
  institution
};
