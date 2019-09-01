import { values } from "./data"

// Calculate the score
export default arr => {
  // all aces as 11,
  // check if under 21
  // if not change first ace into a 1
  // repeat check
  return !arr.filter(Boolean).length
    ? 0
    : arr.reduce((a, b) => a + Math.min(values.indexOf(b[1]) + 1, 10), 0)
}
