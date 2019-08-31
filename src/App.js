// quick-blackjack
import React, { useState } from "react"
import { Header, Button, Card, Divider, Container } from "semantic-ui-react"
import "semantic-ui-css/semantic.min.css"

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
  const [winner, setWinner] = useState()
  const [hands, setHands] = useState({ player: [], dealer: [] })
  const [gameActive, setGameActive] = useState(false)

  // shuffle the deck before every new game
  const newGame = bet => {
    const deck = suits.map(suit => values.map(val => [suit, val])).flat(1)
    const shuffle = deck => deck.sort(() => 0.5 - Math.random())
    const [card1, card2, card3, card4, ...rest] = shuffle(deck)
    setHands({ player: [card1, card2], dealer: [card3, card4] })
    setDeck(rest)
    setStake(bet)
    setCash(cash - bet)
    setGameActive(true)
  }

  // look for a winner
  // TODO: RECONSIDER
  const hitMe = () => {
    const current = hands
    const [card1, card2, ...others] = deck
    const next = {
      player: [...current.player, card1],
      dealer:
        getScore(current.dealer) >= dealerStickOn
          ? current.dealer
          : [...current.dealer, card2]
    }
    if (getScore(next.player) > 21) {
      setWinner("dealer")
      setHands({ player: next.player, dealer: current.dealer })
    } else if (getScore(next.player) === 21 && getScore(next.dealer) < 21) {
      setHands({ player: next.player, dealer: next.dealer })
      setWinner("player")
    } else if (getScore(next.dealer) > 21) {
      setWinner("player")
      setHands({ player: next.player, dealer: next.dealer })
    } else {
      setHands({
        player: next.player,
        dealer:
          getScore(next.dealer) < dealerStickOn ? next.dealer : current.dealer
      })
    }
    setDeck(others)
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

  // clean up
  const endGame = () => {
    if (winner === "player") setCash(cash + stake * 2) // payout
    setGameActive(false)
    setWinner(false)
  }

  // render
  const cardStyle = {
    height: 150,
    display: "inline-block",
    width: 110,
    textAlign: "center",
    fontSize: "2rem",
    paddingTop: 64,
    margin: "0 0.5rem 0 0"
  }
  return (
    <Container>
      <h1 style={{ float: "right" }}>£{cash}</h1>
      {!gameActive &&
        bets.map(bet => (
          <Button disabled={cash < bet} onClick={() => newGame(bet)}>
            {`bet £${bet}`}
          </Button>
        ))}
      {!gameActive && (
        <h1
          style={{ fontSize: "8rem", marginLeft: "3rem", marginTop: "-1rem" }}
          children="↖quick-blackjack"
        />
      )}
      {gameActive && (
        <div>
          <Header>
            {!winner ? (
              <Button disabled={!canStick} onClick={stick} children="stick" />
            ) : (
              <Button onClick={endGame}>play again</Button>
            )}
          </Header>
          {["player", "dealer"].map(name => (
            <React.Fragment>
              <div style={{ opacity: !winner ? 1 : name === winner ? 1 : 0.2 }}>
                <h3>{name}</h3>
                {hands[name].map(card => (
                  <Card
                    style={{
                      ...cardStyle,
                      color: ["♥", "♦"].includes(card[0]) ? "red" : "black"
                    }}
                    childen={card}
                  />
                ))}
                <span style={{ fontSize: "3rem", verticalAlign: "middle" }}>
                  {!winner && name === "player" && (
                    <Button
                      style={{ width: 90 }}
                      disabled={winner}
                      onClick={() => hitMe()}
                      children="hit me"
                    />
                  )}
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
              </div>
              <Divider />
            </React.Fragment>
          ))}
        </div>
      )}
    </Container>
  )
}

export default Game
