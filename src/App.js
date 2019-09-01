// quick-blackjack
import React, { useState, useEffect } from "react"
import { useToasts } from "react-toast-notifications"
import useHotState from "./useHotState"
import { suits, values } from "./data"

const Game = () => {
  const { addToast } = useToasts()

  // the winner
  const [winner, setWinner] = useState()
  const [winReason, setWinReason] = useState()

  // sticking
  const [playerStick, setPlayerStick] = useState(false)
  const [dealerStick, setDealerStick] = useState(false)
  const dealerStickOn = 17

  // create a concept of cash and a betting stake
  const [cash, setCash] = useState(100)
  const [stake, setStake] = useState(0)

  // when cash changes, different bets become available
  const bets = useHotState({
    watch: [cash],
    update: () =>
      cash < 200
        ? [10, 20, 50]
        : cash < 1000
        ? [50, 100, 250]
        : [250, 500, 1000],
    initial: [10, 20, 50]
  })

  // an active game, this marks the start and end of a round
  const [gameActive, setGameActive] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      if (gameActive === "true") {
        // game just started
        hitMe()
      } else {
        // game just ended
        //
      }
    }, 300)
  }, [gameActive])

  // deck and hands
  const [deck, setDeck] = useState([])
  const [hands, setHands] = useState({ player: [], dealer: [] })

  // shuffle the deck before every new game
  const newGame = bet => {
    setWinner(false)
    setStake(bet)
    const newDeck = suits.map(suit => values.map(val => [suit, val])).flat(1)
    const shuffle = deck => deck.sort(() => 0.5 - Math.random())
    const [p, d, ...rest] = shuffle(newDeck)
    setPlayerStick(false)
    setDealerStick(false)
    setHands({ player: [p], dealer: [d] })
    setDeck(rest)
    setGameActive(true)
  }
  const reset = () => {
    setCash(100)
    newGame(10)
  }

  const wonBy = async (name, reason) => {
    setWinner(name)
    setWinReason(reason)
  }

  // every time a winner is set, end the game and pay out
  useEffect(() => {
    if (!winner || !gameActive) return
    setGameActive(false)
    if (winner === "player") setCash(cash + stake) // payout from previous
    if (winner === "dealer") setCash(cash - stake) // payout from previous
    if (winner === "none") {
      addToast("draw", {
        appearance: "info",
        autoDismiss: true
      })
    } else {
      addToast(
        <div>
          <div>{`${winner === "player" ? "+" : "-"}£${stake}`}</div>
          {winReason && <div>{winReason}</div>}
        </div>,
        {
          appearance: winner === "player" ? "success" : "error",
          autoDismiss: true
        }
      )
    }
  }, [winner])

  // const draw = () => {
  //   setGameActive(false)
  //   setWinner("none")
  //   if (gameActive) {
  //     addToast("draw", {
  //       appearance: "info",
  //       autoDismiss: true
  //     })
  //   }
  // }

  const hitMe = () => {
    const [p, d, ...others] = deck
    const newPlayerHand = playerStick ? hands.player : [...hands.player, p]
    if (getScore(newPlayerHand) > 21) {
      setHands({ player: newPlayerHand, dealer: hands.dealer })
      return wonBy("dealer", "you went bust")
    }
    if (
      getScore(hands.dealer) >= dealerStickOn &&
      !playerStick &&
      getScore(hands.dealer) < getScore(newPlayerHand)
    ) {
      setDealerStick(true)
    }
    const newDealerHand = dealerStick ? hands.dealer : [...hands.dealer, d]

    if (
      getScore(newPlayerHand) > 16 &&
      getScore(newPlayerHand) === getScore(newDealerHand)
    ) {
      setHands({ player: newPlayerHand, dealer: newDealerHand })
      return setWinner("none")
    }
    console.log({ newPlayerHand, newDealerHand })
    setTimeout(
      () =>
        setHands({
          player: newPlayerHand,
          dealer: hands.dealer
        }),
      200
    )
    setTimeout(
      () =>
        setHands({
          player: newPlayerHand,
          dealer: newDealerHand
        }),
      300
    )

    if (getScore(hands.dealer) >= dealerStickOn && !playerStick) {
      if (getScore(newPlayerHand) > getScore(hands.dealer)) {
        return wonBy("player", "you win")
      }
    }

    if (getScore(newDealerHand) > 21) {
      return wonBy("player", "dealer went bust")
    }
    if (playerStick && getScore(newDealerHand) > getScore(newPlayerHand)) {
      return wonBy("dealer", "dealer wins") // player stuck, dealer got higher
    }
    if (dealerStick && getScore(newPlayerHand) > getScore(newDealerHand)) {
      return wonBy("player", "you win") // dealer stuck, player is higher
    }
    if (newPlayerHand.length >= 5) {
      return wonBy("player", "five cards")
    }
    if (getScore(newPlayerHand) === 21) {
      return wonBy("player", "twenty one")
    }
    setDeck(others)
  }

  // dealer stick if high enough
  useEffect(() => {
    setDealerStick(getScore(hands.dealer) >= dealerStickOn)
  }, [hands])

  //  player stick. need a better stick logic
  const stick = async () => {
    await setPlayerStick(1)
  }
  useEffect(() => {
    console.log("player stick", playerStick)
    if (playerStick && gameActive) {
      hitMe()
      setTimeout(() => {
        setPlayerStick(playerStick + 1)
      }, 600)
    }
  }, [playerStick])

  // Calculate the score
  const getScore = arr => {
    // all aces as 11,
    // check if under 21
    // if not change first ace into a 1
    // repeat check
    return !arr.filter(Boolean).length
      ? 0
      : arr.reduce((a, b) => a + Math.min(values.indexOf(b[1]) + 1, 10), 0)
  }
  const scores = {
    player: getScore(hands.player),
    dealer: getScore(hands.dealer)
  }
  const canStick = scores.player > scores.dealer && scores.player > 15

  // Title and actions
  const Header = () => {
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

  // Card container
  return (
    <div>
      <Header gameActive={gameActive} />
      <div style={{ marginTop: "2rem" }}>
        {["player", "dealer"].map(name => (
          <React.Fragment>
            <div
              style={
                hands.player.length
                  ? {
                      textAlign: "center",
                      opacity: !winner ? 1 : name === winner ? 1 : 0.5,
                      width: 420,
                      background:
                        getScore(hands[name]) > 21 ? "#fbc0c0" : "#f5f3f3",
                      margin: "0.5rem auto",
                      padding: "0.5rem 0 1rem 0",
                      borderRadius: 16
                    }
                  : { width: 420, margin: "0.5rem auto" }
              }
            >
              <h3
                style={{
                  margin: "2px 0 8px 0",
                  color: name === "dealer" ? "#737373" : "#222"
                }}
              >
                <span>
                  <span style={{ fontWeight: "normal", opacity: 0.5 }}></span>
                  <span>{scores[name] > 0 ? scores[name] : ""}</span>
                  {winner === name ? (
                    " ✅"
                  ) : (
                    <span>
                      {name === "dealer" && dealerStick && !playerStick && "🔒"}
                      {name === "player" && playerStick && "🔒"}
                    </span>
                  )}
                </span>
              </h3>
              {hands[name].map(card =>
                !card ? (
                  ""
                ) : (
                  <div
                    onClick={() => {
                      if (gameActive && card[1] === "Q") {
                        setHands({ player: [], dealer: [] })
                        setCash((cash || 0) + bets[0])
                        addToast(
                          <div>
                            <div>+£{bets[0]}</div>
                            <div>the queen gave you £{bets[0]}</div>
                          </div>,
                          {
                            appearance: "success",
                            autoDismiss: true
                          }
                        )
                        setGameActive(false)
                      }
                    }}
                    style={{
                      height: 90,
                      display: "inline-block",
                      width: 60,
                      textAlign: "center",
                      fontSize: "1rem",
                      margin: "0 0.2rem 0 0.2rem",
                      border: "1px solid #555",
                      borderRadius: "4px",
                      lineHeight: "90px",
                      background: name === "player" ? "white" : "#d4d4d4",
                      color: ["♥", "♦"].includes(card[0]) ? "red" : "black"
                    }}
                    children={card}
                  />
                )
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default Game
