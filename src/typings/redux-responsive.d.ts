declare module 'redux-responsive' {
  export var responsiveStateReducer: any
  export var responsiveStoreEnhancer: any

  export interface ResponsiveBreakpoints {
    extraSmall: boolean
    small: boolean
    medium: boolean
    large: boolean
    infinity: boolean
  }

  export interface ResponsiveState {
    mediaType: string
    orientation: "portrait"| "landscape" | null
    lessThan: ResponsiveBreakpoints
    greaterThan: ResponsiveBreakpoints
    is: ResponsiveBreakpoints
  }
}
