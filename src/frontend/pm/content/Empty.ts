import { epm, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import waittime from "../../helper/waittime"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"

export default class Empty implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  constructor() {
    this.king = "content"
    this.role = "empty"
    this.isLocked = false
  }
  createElement() {
    this.el = kel("div", "Empty pmcontent")
    this.el.innerHTML = `
    <div class="title">
      <div class="img">
        <img src="/assets/kirimin_icon.png" alt="Kirimin" width="75" />
      </div>
      <h1>KIRIMIN</h1>
    </div>
    <div class="desc">
      <p>${lang.LANDING}</p>
    </div>`
  }
  update(): void {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    epm().append(this.el)
  }
}
