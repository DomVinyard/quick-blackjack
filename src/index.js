import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import { ToastProvider } from "react-toast-notifications"

ReactDOM.render(
  <ToastProvider
    placement="top-center"
    autoDismissTimeout={1500}
  >
    <App />
  </ToastProvider>,
  document.getElementById("root")
)
