import kelement from "./kelement"

const localeBadge: { [key: string]: [string, string] } = {
  "1": ["dev", "DEVELOPER"],
  "2": ["staff", "STAFF"],
  "3": ["mod", "MODERATOR"],
  "4": ["dono", "LOYAL DONATOR"],
  "5": ["wl", "WHITELISTED VERIFIED"]
}
function parseBadge(n: number | string): HTMLElement {
  if (typeof n === "number") n = n.toString()
  const i = kelement("i", "B")
  i.innerHTML = localeBadge[n][0]
  i.title = localeBadge[n][1]
  return i
}

export default function setbadge(el: HTMLElement, badges: number[]): void {
  if (badges.length >= 1) {
    for (const badge of badges.sort((a, b) => b - a)) {
      el.append(parseBadge(badge))
    }
  }
}
