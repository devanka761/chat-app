import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"

export default class Empty implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  constructor() {
    this.id = "empty"
  }
  createElement() {
    this.el = kelement("div", "Empty pmcontent")
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
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    culement.app().append(this.el)
  }
}
