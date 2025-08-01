import { eroot, kel } from "./kel"

interface IBadgesSpill {
  start(x: number, y: number): void
  end(): void
  moving(x: number, y: number): void
}

let badgeSpill: BadgesSpill | null = null

const localeBadge: { [key: string]: [string, string] } = {
  "1": ["dev", "DEVELOPER"],
  "2": ["staff", "STAFF"],
  "3": ["mod", "MODERATOR"],
  "4": ["dono", "LOYAL DONATOR"],
  "5": ["wl", "WHITELISTED VERIFIED"],
  "6": ["bot", "Artificial Intelligence"]
}
function parseBadge(n: number | string): HTMLElement {
  if (typeof n === "number") n = n.toString()
  const i = kel("i", "B")
  i.innerHTML = localeBadge[n][0]
  i.title = localeBadge[n][1]

  i.onmouseout = () => {
    if (badgeSpill) {
      badgeSpill.end()
      badgeSpill = null
    }
  }
  i.onmousemove = (e) => {
    if (badgeSpill) badgeSpill.moving(e.clientX, e.clientY)
  }
  i.onmouseover = (e) => {
    if (badgeSpill) badgeSpill.end()
    badgeSpill = new BadgesSpill(i.title)
    badgeSpill.start(e.clientX, e.clientY)
    window.addEventListener(
      "scroll",
      () => {
        if (badgeSpill) {
          badgeSpill.end()
          badgeSpill = null
        }
      },
      { once: true }
    )
  }

  return i
}

export default function setbadge(el: HTMLElement, badges: number[]): void {
  if (badges.length >= 1) {
    for (const badge of badges.sort((a, b) => b - a)) {
      el.append(parseBadge(badge))
    }
  }
}

class BadgesSpill implements IBadgesSpill {
  private el: HTMLDivElement
  private readonly name: string
  private posX: number
  private posY: number
  constructor(name: string) {
    this.name = name
  }
  private createElement(): void {
    this.el = kel("div", "spill")
    eroot().append(this.el)
    const p = kel("p")
    p.innerText = this.name
    this.el.append(p)
  }
  get x(): number {
    return this.posX
  }
  get y(): number {
    return this.posY
  }
  start(x: number, y: number): void {
    this.posX = x
    this.posY = y
    this.createElement()
    this.moving(x, y)
  }
  end(): void {
    this.el.remove()
  }
  moving(x: number, y: number): void {
    this.posX = x
    this.posY = y

    const offsetX = this.el.clientWidth
    const offsetY = this.el.clientHeight

    const topRule = y - (offsetY + 20)
    const topOffset = topRule <= 5 ? y + (offsetY - 30) : topRule

    this.el.style.top = `${topOffset.toString()}px`
    this.el.style.left = `${(x - offsetX / 2).toString()}px`
  }
}
