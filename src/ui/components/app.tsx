import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { AppState, LoadAllDbs } from "../../modules";

interface Props {
  all: string[];
  LoadAllDbs: () => any;
}

export const AppComponent = (props: Props) => {
  return (
    <div>app {props.all.join(', ')}
      <button onClick={() => props.LoadAllDbs()}>load all dbs</button>
    </div>
  );
};

export const App = connect(
  (state: AppState) => ({
    all: state.db.all
  }),
  (dispatch: Dispatch<AppState>) => bindActionCreators( { LoadAllDbs }, dispatch ),
)(AppComponent);
