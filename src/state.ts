import { combineReducers } from "redux";
import { InstitutionSlice, DbSlice } from "./modules";

export type App = InstitutionSlice & DbSlice;

export const App = combineReducers<App>(Object.assign({}, InstitutionSlice, DbSlice));
