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
  private btnCreate: HTMLDivElement
  private actions: HTMLDivElement
  constructor() {
    this.king = "content"
    this.role = "posts"
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kel("div", "Posts pmcontent")
    this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    const etitle = kel("div", "sect-title", { e: lang.APP_POSTS })
    const top = kel("div", "top", { e: [this.btnBack, etitle] })

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)

    this.btnCreate = kel("div", "btn btn-create", { e: `<i class="fa-solid fa-plus"></i> ${lang.POSTS_CREATE}` })
    this.actions = kel("div", "actions")
    this.actions.append(this.btnCreate)
    this.wall.append(this.actions)
  }
  private btnListener(): void {
    this.btnBack.onclick = () => adap.swipe()
  }
  private tempCard(): void {
    const card = kel("div", "card")
    card.innerHTML = `
    <div class="user">
      <div class="img">
        <img src="/assets/user.jpg" alt="user" />
      </div>
      <div class="name">
        <div class="dname">Display Name Goes Here</div>
        <div class="ts">11:12 11/12/17</div>
      </div>
    </div>
    <div class="media">
      <img src="/assets/fivem_wp.jpg" alt="fivem" />
    </div>
    <div class="options">
      <div class="opt-visitor">
        <div class="btn btn-likes">
          <i class="fa-regular fa-heart"></i>
          <span>1</span>
        </div>
        <div class="btn btn-comments">
          <i class="fa-regular fa-comment"></i>
          <span>1</span>
        </div>
      </div>
      <div class="opt-author">
        <div class="btn btn-delete">
          <i class="fa-regular fa-trash-xmark"></i>
        </div>
      </div>
    </div>
    <div class="text">
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Delectus recusandae doloremque rem molestias minima alias dolorum, quidem libero iste veritatis ipsa, sunt quasi tenetur reiciendis maxime non, voluptatum labore repudiandae.
    </div>`
    this.wall.prepend(card, card.cloneNode(true))
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
    this.tempCard()
  }
}
