import { useState, useEffect } from "react"

// this is a way to use read-only derived states

const useHotState = ({ watch, update, initial }) => {
  const [hotState, setHotState] = useState(initial)
  useEffect(() => setHotState(update), watch)
  return hotState
}

export default useHotState
