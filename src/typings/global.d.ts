/// <reference types='react-addons-perf'/>
/// <reference types='webpack-env'/>

interface Measurements {}

interface PerfAPI {
  start(): void;
  stop(): void;
  printInclusive(measurements?: Measurements[]): void;
  printExclusive(measurements?: Measurements[]): void;
  printWasted(measurements?: Measurements[]): void;
  printOperations(measurements?: Measurements[]): void;
  getLastMeasurements(): Measurements[];
  getExclusive(measurements?: Measurements[]): any;
  getInclusive(measurements?: Measurements[]): any;
  getWasted(measurements?: Measurements[]): any;
  getOperations(measurements?: Measurements[]): any;
}

declare module NodeJS {
  interface Global {
    Perf: PerfAPI
    mainWasRun: boolean
  }
}

interface NodeModule {
  hot: __WebpackModuleApi.Hot
}

declare const __DEVELOPMENT__: boolean
declare const __TEST__: boolean

type PropTypes2<T, R extends React.Validator<any>> = { [K in keyof T]: R }
type PropTypes<T> = PropTypes2<T, React.Validator<any>>

type TDocument<T, ID> = PouchDB.Core.Document<T> & { _id: ID; _rev?: string } & PouchDB.Core.GetMeta
type AnyDocument = TDocument<{}, string>
type ChangeSet = Set<AnyDocument>

namespace PouchDB {
    namespace LevelDbAdapter {
        interface LevelDbAdapterConfiguration extends Configuration.LocalDatabaseConfiguration {
            db: any
        }
    }

    namespace Core {
        interface DatabaseInfo {
            db_name: string
            doc_count: number
            update_seq: number
        }
    }
}
