/// <reference types='webpack-env'/>


declare module NodeJS {
  interface Global {
    mainWasRun: boolean
  }
}

interface NodeModule {
  hot: __WebpackModuleApi.Hot
}
