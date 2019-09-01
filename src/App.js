// quick-blackjack
import React, { useState } from "react"

const suits = ["♠", "♥", "♦", "♣"]
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K"
]
const bets = [10, 20, 50]
const dealerStickOn = 17

const Game = () => {
  const [cash, setCash] = useState(100)
  const [stake, setStake] = useState(0)
  const [deck, setDeck] = useState([])
  const [dealerStick, setDealerStick] = useState(false)
  const [winner, setWinner] = useState()
  const [hands, setHands] = useState({ player: [], dealer: [] })
  const [gameActive, setGameActive] = useState(false)

  // shuffle the deck before every new game
  const newGame = async bet => {
    if (winner === "player") await setCash(cash + stake * 2) // payout from previous
    const deck = suits.map(suit => values.map(val => [suit, val])).flat(1)
    const shuffle = deck => deck.sort(() => 0.5 - Math.random())
    const [card1, card2, card3, card4, ...rest] = shuffle(deck)
    setWinner(false)
    setHands({ player: [card1, card2], dealer: [card3, card4] })
    setDeck(rest)
    setStake(bet)
    setGameActive(true)
  }

  const wonBy = async name => {
    setGameActive(false)
    setWinner(name)
    if (name === "player") await setCash(cash + stake) // payout from previous
    if (name === "dealer") await setCash(cash - stake) // payout from previous
    setDealerStick(false)
  }

  const hitMe = () => {
    const [p, d, ...others] = deck
    setDeck(others)
    const newPlayerHand = [...hands.player, p]
    if (getScore(newPlayerHand) > 21) {
      setHands({ player: newPlayerHand, dealer: hands.dealer })
      return wonBy("dealer") // player went bust
    }
    const newDealerHand = dealerStick ? hands.dealer : [...hands.dealer, d]
    setHands({
      player: newPlayerHand,
      dealer: newDealerHand
    })
    if (getScore(newDealerHand) > 21) {
      return wonBy("player") // dealer went bust
    }
    if (getScore(newDealerHand >= dealerStickOn)) {
      setDealerStick(true)
    }
    if (dealerStick && getScore(newPlayerHand) > getScore(newDealerHand)) {
      return wonBy("player") // dealer sticks, player is higher
    }
    if (newPlayerHand.length >= 5) {
      return wonBy("player") // player gets 5 cards
    }
  }

  const Header = () => {
    return (
      <h1 style={{ textAlign: "center" }}>
        £{cash}
        <div>
          {!gameActive &&
            bets.map(bet => (
              <button disabled={cash < bet} onClick={() => newGame(bet)}>
                {`bet £${bet}`}
              </button>
            ))}
          {gameActive && (
            <div>
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
      </h1>
    )
  }

  // one-card player stick.
  const stick = async () => {
    const [card] = deck
    await setHands({
      player: hands.player,
      dealer: [...hands.dealer, card]
    })
    if (
      getScore(hands.player) > getScore([...hands.dealer, card]) ||
      getScore(hands.dealer) > 21
    ) {
      setWinner("player")
    } else {
      setWinner("dealer")
    }
  }

  // Calculate the score
  const getScore = arr =>
    arr.reduce((a, b) => a + Math.min(values.indexOf(b[1]) + 1, 10), 0)
  const scores = {
    player: getScore(hands.player),
    dealer: getScore(hands.dealer)
  }
  const canStick = scores.player > scores.dealer && scores.player > 15

  // render
  return (
    <div>
      <Header gameActive={gameActive} />
      <div>
        {["player", "dealer"].map(name => (
          <React.Fragment>
            <div
              style={{
                textAlign: "center",
                opacity: !winner ? 1 : name === winner ? 1 : 0.2
              }}
            >
              <h3>
                <span>
                  <span>{scores[name]}</span>
                  {getScore(hands[name]) > 21 && " | BUST "}
                  {winner === "player" &&
                    (name === "player" && ` | WIN £${stake * 2}🎉`)}
                  {name === "player" &&
                    winner === "dealer" &&
                    ` | LOSE £${stake}`}
                  {name === "dealer" &&
                    !winner &&
                    getScore(hands.dealer) >= dealerStickOn &&
                    getScore(hands.dealer) < 21 &&
                    " | STICK"}
                </span>
              </h3>
              {hands[name].map(card => (
                <div
                  style={{
                    height: 90,
                    display: "inline-block",
                    width: 60,
                    textAlign: "center",
                    fontSize: "1rem",
                    margin: "0 0.5rem 0 0",
                    border: "1px solid black",
                    borderRadius: "4px",
                    lineHeight: "90px",
                    background: name === "player" ? "white" : "#d4d4d4",
                    color: ["♥", "♦"].includes(card[0]) ? "red" : "black"
                  }}
                  children={card}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default Game
