import React from "react"
const Table = ({
  hands,
  winner,
  getScore,
  scores,
  dealerStick,
  playerStick,
  gameActive,
  setHands,
  setCash,
  cash,
  bets,
  addToast,
  setGameActive
}) => (
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
)

export default Table