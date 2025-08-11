import userState from "./userState"

type RouteHandler = (params: Record<string, string>) => void

interface Route {
  path: string
  handler: RouteHandler
}

class Router {
  private routes: Route[] = []
  private basePath: string
  constructor(basePath: string = "/app") {
    this.basePath = basePath.replace(/\/$/, "")
    window.addEventListener("popstate", () => this.resolve())
    this.init()
  }
  add(path: string, handler: RouteHandler): void {
    this.routes.push({ path, handler })
  }
  navigate(path: string, role: "content" | "center" = "content"): void {
    if (role === "center" && !userState.center) {
      console.log(`role === "center" && !userState.center`)
      window.history.replaceState({}, "", this.basePath + path)
    } else if (role === "center") {
      if (userState.center?.role === "chats" && path.length >= 1) {
        console.log(`userState.center?.role === "chats" && path.length >= 1`)
        window.history.pushState({}, "", this.basePath + path)
      } else if (path.length < 1) {
        console.log(`path.length < 1`)
        window.history.back()
        return
      } else {
        console.log(`else 1`)
        window.history.replaceState({}, "", this.basePath + path)
      }
      // const center = userState.center.role
    } else {
      console.log(`else 2`)
      window.history.pushState({}, "", this.basePath + path)
    }

    this.resolve()
  }
  init(): void {
    this.resolve()
  }
  back(): void {
    window.history.back()
  }
  forwoard(): void {
    window.history.forward()
  }
  private resolve() {
    const currentPath = window.location.pathname.replace(this.basePath, "") || "/"
    for (const route of this.routes) {
      const match = this.matchRoute(currentPath, route.path)
      if (match) {
        route.handler(match)
        return
      }
    }
    console.warn("No route matched:", currentPath)
  }
  private matchRoute(urlPath: string, routePath: string): Record<string, string> | null {
    const urlParts = urlPath.split("/").filter(Boolean)
    const routeParts = routePath.split("/").filter(Boolean)

    if (urlParts.length !== routeParts.length) return null
    const params: Record<string, string> = {}
    for (let i = 0; i < routeParts.length; i++) {
      const rPart = routeParts[i]
      const uPart = urlParts[i]

      if (rPart.startsWith(":")) {
        params[rPart.slice(1)] = decodeURIComponent(uPart)
      } else if (rPart !== uPart) {
        return null
      }
    }
    return params
  }
}

export default new Router("/app")
