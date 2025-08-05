import { eroot, kel } from "../helper/kel"

interface IBadgesSpill {
  start(x: number, y: number): void
  end(): void
  moving(x: number, y: number): void
}

let badgeSpill: BadgesSpill | null = null

class BadgesSpill implements IBadgesSpill {
  private el: HTMLDivElement
  private readonly name: string
  private posX: number
  private posY: number
  private timeOut: ReturnType<typeof setTimeout> | null
  constructor(name: string) {
    this.name = name
    this.timeOut = null
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
    if (this.timeOut) clearTimeout(this.timeOut)
    this.timeOut = null
    this.el.remove()
    badgeSpill = null
  }
  moving(x: number, y: number): void {
    if (this.timeOut) clearTimeout(this.timeOut)
    this.timeOut = setTimeout(() => this.end(), 2000)

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

export function createBadge(title: string, x: number, y: number): void {
  if (badgeSpill) badgeSpill.end()
  badgeSpill = new BadgesSpill(title)
  badgeSpill.start(x, y)
}

export function removeBadge(): void {
  if (badgeSpill) badgeSpill.end()
}
export function moveBadge(x: number, y: number): void {
  if (badgeSpill) badgeSpill.moving(x, y)
}
