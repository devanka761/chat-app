import Chats from "../pm/center/Chats"
import Empty from "../pm/content/Empty"
import { PrimaryClass } from "../types/userState.types"
import adap from "./adaptiveState"
import userState from "./userState"

type AppState = {
  view: string
  [key: string]: string | number | boolean
}

type Handler = (state: AppState) => void

type Route = {
  matchState: Partial<AppState>
  handler: Handler
}

class Router {
  private routes: Route[] = []

  constructor() {
    window.addEventListener("popstate", this.handlePopState.bind(this))
  }

  public navigate(state: AppState, newer: PrimaryClass = new Empty()): void {
    this.routes.push({
      matchState: state,
      handler: () => adap.swipe(newer)
    })
    if (newer.king === "center" && userState.center?.role !== "chats") {
      window.history.replaceState(state, "", window.location.pathname)
    } else {
      window.history.pushState(state, "", window.location.pathname)
    }
    if (!adap.narrow) adap.swipe(newer)
    this.resolve(state)
  }
  back(): void {
    window.history.back()
  }

  private handlePopState(event: PopStateEvent): void {
    this.resolve(event.state)
  }

  private resolve(state: AppState | null): void {
    if (!adap.narrow) return
    // if (!state) {
    //   return
    // }
    if (!state) state = { view: "chats" }

    const potentialMatches = this.routes.filter((route) => {
      return Object.keys(route.matchState).every((key) => route.matchState[key] === state[key])
    })

    if (potentialMatches.length > 0) {
      potentialMatches.sort((a, b) => Object.keys(b.matchState).length - Object.keys(a.matchState).length)
      const bestMatch = potentialMatches[0]
      bestMatch.handler(state)
    } else {
      adap.swipe(new Chats())
    }
  }
}

export default new Router()
