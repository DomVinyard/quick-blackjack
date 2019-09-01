import React from "react"
const Header = ({
  cash,
  gameActive,
  bets,
  newGame,
  reset,
  stake,
  winner,
  hitMe,
  stick,
  canStick
}) => {
  return (
    <div style={{ textAlign: "center", marginTop: 92 }}>
      <h1>£{cash}</h1>
      <div>
        {cash > 0 &&
          !gameActive &&
          bets.map(bet => (
            <button disabled={cash < bet} onClick={() => newGame(bet)}>
              {`bet £${bet}`}
            </button>
          ))}
        {cash <= 0 && <button onClick={reset}>new game</button>}
      </div>
      {gameActive && (
        <div>
          <span style={{ color: "firebrick", marginRight: 8 }}>£{stake}</span>
          <button
            style={{ width: 90 }}
            disabled={winner}
            onClick={() => hitMe()}
            children="hit me"
          />
          <button disabled={!canStick} onClick={stick} children="stick" />
        </div>
      )}
    </div>
  )
}

export default Header
