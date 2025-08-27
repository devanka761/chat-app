import waittime from "../../../helper/waittime"

type DoodleConfig = {
  root: HTMLElement
  fillRatio: number
  strength: number
  delay?: number
}
type ComputedGrid = {
  cols: number
  rows: number
  cell: number
}

const ICON_LIST: string[] = ["fa-jelly-fill fa-regular fa-music", "fa-jelly-fill fa-regular fa-paperclip", "fa-jelly-fill fa-regular fa-bolt", "fa-jelly-fill fa-regular fa-comment-dots", "fa-jelly-fill fa-regular fa-mug-hot", "fa-jelly-fill fa-regular fa-paper-plane", "fa-jelly-fill fa-regular fa-gamepad", "fa-jelly-fill fa-regular fa-camera", "fa-jelly-fill fa-regular fa-alarm-clock", "fa-jelly-fill fa-regular fa-bell", "fa-jelly-fill fa-regular fa-sparkles", "fa-jelly-fill fa-regular fa-video", "fa-jelly-fill fa-regular fa-face-grin", "fa-jelly-fill fa-regular fa-paw", "fa-jelly-fill fa-regular fa-tv-retro", "fa-jelly-fill fa-regular fa-microphone", "fa-jelly-fill fa-regular fa-house", "fa-jelly-fill fa-regular fa-location-dot", "fa-jelly-fill fa-regular fa-bookmark", "fa-jelly-fill fa-regular fa-shirt", "fa-jelly-fill fa-regular fa-thumbtack", "fa-jelly-fill fa-regular fa-leaf", "fa-jelly-fill fa-regular fa-flower", "fa-jelly-fill fa-regular fa-martini-glass", "fa-jelly-fill fa-regular fa-wand-magic-sparkles", "fa-jelly-fill fa-regular fa-heart"]

let restartBuild: ReturnType<typeof setTimeout> | null = null
export default class Doodles {
  private resizeObserver: ResizeObserver
  private el: HTMLDivElement = document.createElement("div")
  constructor(private config: DoodleConfig) {
    this.run()
  }
  private createElement(): void {
    this.el.classList.add("doodle-pattern", "parallax")
    this.el.setAttribute("aria-hidden", "true")
    this.el.setAttribute("x-doodle", "devanka")
  }
  private pick(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)]
  }
  private computeGrid(container: HTMLDivElement): ComputedGrid {
    const cs = getComputedStyle(document.documentElement)
    const cell = parseFloat(cs.getPropertyValue("--cell")) || 88
    const rect = container.getBoundingClientRect()
    const cols = Math.ceil(rect.width / cell)
    const rows = Math.ceil(rect.height / cell)
    return { cols, rows, cell }
  }
  private buildGrid(): void {
    this.el.innerHTML = ""
    const { cols, rows } = this.computeGrid(this.el)
    const grid = document.createElement("div")
    grid.className = "doodle-grid"
    grid.style.setProperty("--cols", cols.toString())
    const total = cols * rows

    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div")
      cell.className = "doodle-item"

      if (Math.random() < this.config.fillRatio) {
        const icon = document.createElement("i")
        const iconClass = this.pick(ICON_LIST)
        icon.className = iconClass
        cell.appendChild(icon)
      }

      const tilt = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tilt")) || 20

      const angle = Math.random() * tilt * 2 - tilt
      cell.style.setProperty("--r", angle.toString() + "deg")

      grid.append(cell)
    }

    this.el.append(grid)
  }

  private debounce(fn: typeof this.buildGrid, wait = 150) {
    if (restartBuild) {
      clearTimeout(restartBuild)
    }
    restartBuild = setTimeout((...args) => {
      fn(...args)
      restartBuild = null
    }, wait)
  }
  private onResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.debounce(() => this.buildGrid(), 150)
    })
    this.resizeObserver.observe(this.config.root)
  }
  private onPointerMove(): void {
    this.config.root.onpointermove = (e) => {
      if (!this.el.classList.contains("parallax")) return
      const rect = this.el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      const grid: HTMLDivElement | null = this.el.querySelector(".doodle-grid")
      if (grid) {
        grid.style.transform = `translate(${dx * this.config.strength}px, ${dy * this.config.strength}px)`
      }
    }
  }
  end(): void {
    this.resizeObserver.disconnect()
    this.config.root.onpointermove = null
    this.el.remove()
  }
  async start(): Promise<void> {
    if (this.config.delay) await waittime(this.config.delay)
    this.createElement()
    this.config.root.append(this.el)
    this.buildGrid()
    this.onResize()
    this.onPointerMove()
  }
  private run(): this {
    this.start()
    return this
  }
}
