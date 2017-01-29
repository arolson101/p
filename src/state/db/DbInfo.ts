
export interface DbInfo {
  name: string
  location: string
}

export namespace DbInfo {

  export namespace routes {
    export const home = 'home'
  }

  export namespace to {
    export const home = () => {
      return '/' + routes.home
    }
  }
}
