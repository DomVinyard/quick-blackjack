import { useState, useEffect } from "react"

// this is a way to use read-only derived states

const useHotState = ({ watch, update, initial }) => {
  const [hotState, setHotState] = useState(initial)
  useEffect(() => setHotState(update), watch)
  return hotState
}

// used in App.js:

/*
const bets = useHotState({
    watch: [cash],
    update: () =>
      cash < 50
        ? [1, 2, 5]
        : cash < 200
        ? [10, 20, 50]
        : cash < 2000
        ? [50, 100, 250]
        : [250, 500, 1000],
    initial: [10, 20, 50]
  })
*/

export default useHotState
