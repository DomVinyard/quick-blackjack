import { useState, useEffect } from "react"

const useHotState = ({ watch, update, initial }) => {
  const [hotState, setHotState] = useState(initial)
  useEffect(() => setHotState(update), [watch])
  return hotState
}

export default useHotState
