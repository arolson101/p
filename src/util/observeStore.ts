// https://github.com/reactjs/redux/issues/303#issuecomment-125184409
export function observeStore<State, Slice> (
  store: Redux.Store<State>,
  select: (state: State) => Slice,
  onChange: (slice: Slice) => any) {
  let currentState: Slice

  function handleChange () {
    let nextState = select(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  let unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}
