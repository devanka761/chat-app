import { epm, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import adap from "../../main/adaptiveState"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"

export default class Posts implements PrimaryClass {
  king?: "center" | "content" | undefined
  role: string
  isLocked: boolean
  private btnBack: HTMLDivElement
  private wall: HTMLDivElement
  private el: HTMLDivElement
  constructor() {
    this.king = "content"
    this.role = "posts"
    this.isLocked = false
  }
  createElement(): void {
    this.el = kel("div", "Posts pmcontent")
    this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    const etitle = kel("div", "sect-title", { e: lang.APP_POSTS })
    const top = kel("div", "top", { e: [this.btnBack, etitle] })

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)

    this.wall.innerHTML = `<p>~ Under Maintenance ~</p><p>~ Sedang Dalam Perbaikan ~</p>`
  }
  private btnListener(): void {
    this.btnBack.onclick = () => adap.swipe()
  }
  update(): void {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    epm().append(this.el)
    this.btnListener()
  }
}
