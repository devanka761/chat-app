import { kelement, qulement } from "./kel"

function waittime(ms = 495) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let nindex = 0
let ndone = 0
let nshowtime: ReturnType<typeof setTimeout> | null = null

// const cl = { "1": "g", "2": "y", "3": "r", "4": "rb" }

class Notip {
  readonly a: string
  readonly b: string
  readonly c: string | number
  readonly ic: string
  private el: HTMLDivElement | undefined
  constructor(s: { a: string; b: string; ic: string; c: string | number }) {
    this.a = s.a
    this.b = s.b
    this.c = s.c
    this.ic = s.ic
  }
  createElement(): void {
    this.el = kelement("div", "notip")
    qulement(".app").append(this.el)
  }
  writeData(): void {
    if (!this.el) return
    const eicon = kelement("div", "icon")
    const etop = kelement("div", "top")
    const ebottom = kelement("div", "bottom")
    const etext = kelement("div", "text")
    etext.append(etop, ebottom)
    const edetail = kelement("div", "detail")
    edetail.append(eicon, etext)
    const eclose = kelement("div", "close btn-close", { e: `<div class="btn"><i class="fa-solid fa-x"></i></div>` })
    this.el.append(edetail, eclose)
    // if (this.c) this.el.classList.add(cl[this.c.toString()])
    if (this.ic) eicon.innerHTML = '<i class="fa-solid fa-' + this.ic + '"></i>'
    if (this.a) etop.innerText = this.a
    if (this.b) ebottom.innerText = this.b

    eclose.onclick = () => {
      if (nshowtime) clearTimeout(nshowtime)
      this.destroy()
    }
  }
  async destroy(): Promise<void> {
    if (!this.el) return
    this.el.classList.add("out")
    await waittime()
    this.el.remove()
    ndone++
    if (ndone === nindex) {
      ndone = 0
      nindex = 0
    }
    nshowtime = null
  }
  run() {
    this.createElement()
    this.writeData()
    nshowtime = setTimeout(() => {
      this.destroy()
    }, 3995)
  }
}

async function addNotip(s: { a: string; b: string; c: string | number; ic: string }, currIndex: number) {
  if (ndone + 1 !== currIndex) return setTimeout(() => addNotip(s, currIndex), 250)
  if (nshowtime) {
    clearTimeout(nshowtime)
    nshowtime = null
  }

  const notip = new Notip(s)
  notip.run()
}

export default function notip(data: { a?: string; b?: string; c?: string | number; ic?: string }) {
  const newData: { a: string; b: string; c: string | number; ic: string } = Object.assign({}, { a: "", b: "", ic: "bell", c: "0" }, data)
  nindex++
  addNotip(newData, nindex)
}
