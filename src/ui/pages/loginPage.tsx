import Divider from 'material-ui/Divider'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import { List, ListItem } from 'material-ui/List'
import MenuItem from 'material-ui/MenuItem'
import { grey400 } from 'material-ui/styles/colors'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Paper from 'material-ui/Paper'
import * as React from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { AppState, AppDispatch, historyAPI, OpenDb } from '../../modules'

const icons = {
  newDb: {
    className: 'fa fa-user-plus'
  },
  openDb: {
    className: 'fa fa-sign-in'
  }
}

const translations = defineMessages({
  newDb: {
    id: 'newDb',
    defaultMessage: 'New'
  },
  newDbDescription: {
    id: 'newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

interface ConnectedProps {
//  allDbs: string[]
}

interface Props {
}

const style = {
  paper: {
    display: 'inline-block',
    margin: '16px 32px 16px 0'
  }
}

const iconButtonElement = (
  <IconButton
    touch={true}
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
)

const rightIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>Delete</MenuItem>
  </IconMenu>
)

// export const LoginPageComponent = (props: Props & ConnectedProps) => (
//   <div>
//     <Paper style={style.paper}>
//       <List>
//         {props.allDbs.map(dbName =>
//           <ListItem
//             key={dbName}
//             primaryText={dbName}
//             leftIcon={<FontIcon {...icons.openDb} />}
//             rightIconButton={rightIconMenu}
//           />
//         )}
//         {props.allDbs.length > 0 &&
//           <Divider/>
//         }
//         <ListItem
//           primaryText={<FormattedMessage {...translations.newDb}/>}
//           secondaryText={<p><FormattedMessage {...translations.newDbDescription}/></p>}
//           secondaryTextLines={1}
//           leftIcon={<FontIcon {...icons.newDb} />}
//           onTouchTap={() => historyAPI.push('/create')}
//         />
//       </List>
//     </Paper>
//   </div>
// )

import { createSelector } from 'reselect'


const currentDbSelector = createSelector(
  (state: AppState) => state.db.current ? state.db.current.handle : undefined,
  (state: AppState) => state.db.current ? state.db.current.seq : undefined,
  (db, seq) => db
)


const metaDbSelector = createSelector(
  (state: AppState) => state.db.meta ? state.db.meta.handle : undefined,
  (state: AppState) => state.db.meta ? state.db.meta.seq : undefined,
  (db, seq) => db
)


interface State {
  loading: boolean
  error?: Error
  dbs?: string[]
}

interface ConnectedProps {
  meta?: OpenDb
}

interface Doc {
  _id: string
  name: string
}

const addDb = (db: OpenDb) => {
  db.handle.put({_id: Date.now().toString(), name: Date.now().toString()})
}

const LoginPageRender = (props: ConnectedProps & State) => (
  <div>[{props.dbs!.join(', ')}]
    <button onClick={() => addDb(props.meta!)}>add</button>
  </div>
)

@connect(
  (state: AppState): ConnectedProps => ({
    meta: state.db.meta
  })
)
export class LoginPage extends React.Component<Props & ConnectedProps, State> {
  state = {
    loading: true,
    error: undefined,
    dbs: []
  }

  componentDidMount() {
    if (this.props.meta) {
      this.runQuery(this.props.meta)
    }
  }

  componentWillReceiveProps(nextProps: Props & ConnectedProps) {
    if (nextProps.meta !== this.props.meta) {
      this.runQuery(nextProps.meta!)
    }
  }

  runQuery(meta: OpenDb) {
    this.setState({ loading: true })
    const query = meta.handle.allDocs({include_docs: true}).then((docs) => docs.rows.map(row => (row.doc as Doc).name))
    query.then(
      dbs => this.setState({ loading: false, dbs }),
      error => this.setState({ loading: false, error })
    )
  }

  addDb() {
    this.props.meta!.handle.put({_id: Date.now().toString(), name: Date.now().toString()})
  }

  render() {
    return <LoginPageRender {...this.props} {...this.state}/>
  }
}

type ComponentType<P> = React.ComponentClass<P> | React.StatelessComponent<P>;

interface PState<T> {
  loading: boolean
  error?: Error
  value?: T
}
interface PProps<T> {
  query: Promise<T>
}
const Queried = function<P>(Wrapped: ComponentType<P>) {return class Promised<P, T> extends React.Component<P & PProps<T>, PState<T>> {
  constructor(props: P) {
    super(props)
    this.state = { loading: true, error: undefined, value: undefined }
  }
  componentDidMount() {
    this.props.query.then(
      value => this.setState({ loading: false, value }),
      error => this.setState({ loading: false, error })
    )
  }
  render() {
    return <Wrapped {...this.props} {...this.state}>{this.props.children}</Wrapped>
  }
}}

interface ConnectedPProps {
  db?: PouchDB.Database<any>
}
// @connect(
//   (state: AppState) => ({ db: metaDbSelector(state) })
// )
// class Foo2 extends React.Component<PProps<number> & ConnectedPProps, PState<number>> {
//   constructor(props: PProps<number>) {
//     super(props)
//     this.state = { loading: true, error: undefined, value: undefined }
//   }
//   componentDidMount() {
//     if (!)
//     this.props.query.then(
//       value => this.setState({ loading: false, value }),
//       error => this.setState({ loading: false, error })
//     )
//   }
//   render() {
//     return <Foo {...this.props} {...this.state}>{this.props.children}</Foo>
//   }
// }

interface FProps {
  query: Promise<number>
}
const Foo = (props: FProps & PState<number>) => {
  if(props.loading) {
    console.log('loading')
    return <div>loading</div>
  }

  return <div>result: {props.value}</div>
}
const AsyncFoo = Queried(Foo)

const p: Promise<string> = Promise.resolve('bar')
const promise: Promise<number> = p
//export const LoginPage = () => <Foo2 query={promise}/>

// const allDbSelector = createSelector(
//   metaDbSelector,
//   (db) => db ? db.allDocs() : undefined
// )

// export const LoginPage = connect(
//   (state: AppState): ConnectedProps => ({
//     allDbs: state.db.all
//   }),
//   (dispatch: AppDispatch) => bindActionCreators( { }, dispatch ),
// )(LoginPageComponent) as React.ComponentClass<Props>
