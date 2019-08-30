// blackjack game
import React, { useState, useEffect } from "react"
const shuffle = deck => deck.sort(() => 0.5 - Math.random())
const bets = [10, 20]
const Game = () => {
  const [cash, setCash] = useState(100)
  const [stake, setStake] = useState(0)
  const [deck, setDeck] = useState([])
  // const [winner, setWinner] = useState()
  const [hands, setHands] = useState({ player: [], dealer: [] })
  const [gameActive, setGameActive] = useState(false)

  // shuffle the deck before every new game
  useEffect(() => {
    const deck = suits.map(suit => values.map(val => [suit, val])).flat(1)
    const [p1, p2, d1, d2, ...others] = shuffle(deck)
    setHands({ player: [p1, p2], dealer: [d1, d2] })
    setDeck(others)
  }, [gameActive])

  // game logic
  const newGame = bet => {
    setCash(cash - bet)
    setStake(bet)
    setGameActive(true)
  }
  const hitMe = () => {
    const [p, d, ...others] = deck
    setHands({
      player:
        scores.player > 20 ? hands.player : [...hands.player, p],
      dealer:
        scores.dealer > 20 ? hands.dealer : [...hands.dealer, d]
    })
    setDeck(others)
  }
  const stick = () => {
    const [d, ...others] = deck
    setHands({
      player: hands.player,
      dealer: [...hands.dealer, d]
    })
  }

  // get the score and check for a winner
  const getScore = arr =>
    arr.reduce((a, b) => a + Math.min(values.indexOf(b[1]) + 1, 10), 0)
  const scores = {
    player: getScore(hands.player),
    dealer: getScore(hands.dealer)
  }
  const winner =
    scores.player < 22 && scores.dealer > 21
      ? "player"
      : scores.player > 21
      ? "dealer"
      : false

  return (
    <div>
      <h1>£{cash}</h1>
      {!gameActive &&
        bets.map(bet => (
          <button disabled={cash < bet} onClick={() => newGame(bet)}>
            {`bet £${bet}`}
          </button>
        ))}
      {gameActive && (
        <div>
          {!winner && (
            <React.Fragment>
              <button
                onClick={() => {
                  const [p, d, ...others] = deck
                  setHands({
                    player:
                      scores.player > 20 ? hands.player : [...hands.player, p],
                    dealer:
                      scores.dealer > 20 ? hands.dealer : [...hands.dealer, d]
                  })
                  setDeck(others)
                }}
              >
                hit me
              </button>
              {scores.player > scores.dealer && scores.player > 15 && (
                <button onClick>stick</button>
              )}
            </React.Fragment>
          )}
          {winner === "dealer" && (
            <button onClick={() => setGameActive(false)}>play again</button>
          )}
          {winner === "player" && (
            <button
              onClick={() => {
                setCash(cash + stake * 2)
                setGameActive(false)
              }}
            >
              play again
            </button>
          )}
          {["player", "dealer"].map(name => (
            <div style={{ opacity: !winner ? 1 : name === winner ? 1 : 0.2 }}>
              <h3>
                {name} ({scores[name]})
              </h3>
              {hands[name].map(card => (
                <span
                  style={{
                    padding: 8,
                    border: "1px solid",
                    margin: 2,
                    height: 100,
                    display: "inline-block",
                    width: 64,
                    textAlign: "center"
                  }}
                >
                  {card}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const suits = ["♠", "♥", "♦", "♣"]
const values = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king"
]

export default Game
