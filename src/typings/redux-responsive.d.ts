declare module 'redux-responsive' {
  export function responsiveStateReducer(): ResponsiveState
  export function responsiveStoreEnhancer(): any

  export interface ResponsiveBreakpoints<T> {
    extraSmall: T
    small: T
    medium: T
    large: T
    infinity: T
  }

  export interface ResponsiveState {
    breakpoints: ResponsiveBreakpoints<number>
    mediaType: string
    orientation: "portrait"| "landscape" | null
    lessThan: ResponsiveBreakpoints<boolean>
    greaterThan: ResponsiveBreakpoints<boolean>
    is: ResponsiveBreakpoints<boolean>
  }
}
