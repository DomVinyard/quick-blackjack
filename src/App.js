// quick-blackjack
import React, { useState, useEffect } from "react"
import { useToasts } from "react-toast-notifications"
import useHotState from "./useHotState"
import { suits, values } from "./data"
import getScore from "./get-score-from-hand"
import Header from "./Header"
import useLocalStorage from "./useLocalStorage"
import Table from "./Table"

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
  // on first load set it to 100, after that get from
  const [cash, setCash] = useLocalStorage("cash", 100)
  // const [cash, setCash] = useState(100)
  const [stake, setStake] = useState(0)
  const [betCount, setBetCount] = useLocalStorage("bet-count", 0)

  // when cash changes, different bets become available
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

  // an active game, this marks the start and end of a round
  const [gameActive, setGameActive] = useState(false)

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
    setBetCount(betCount + 1)
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

  const scores = {
    player: getScore(hands.player),
    dealer: getScore(hands.dealer)
  }
  const canStick = scores.player > scores.dealer && scores.player > 15
  // Card container
  return (
    <div>
      <Header
        cash={cash}
        gameActive={gameActive}
        bets={bets}
        newGame={newGame}
        reset={reset}
        stake={stake}
        winner={winner}
        hitMe={hitMe}
        stick={stick}
        canStick={canStick}
      />
      <Table
        hands={hands}
        winner={winner}
        getScore={getScore}
        scores={scores}
        dealerStick={dealerStick}
        playerStick={playerStick}
        gameActive={gameActive}
        setHands={setHands}
        setCash={setCash}
        cash={cash}
        bets={bets}
        addToast={addToast}
        setGameActive={setGameActive}
        betCount={betCount}
      />
    </div>
  )
}

export default Game
