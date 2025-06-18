import { kel } from "../helper/kel"
import setbadge from "../helper/setbadge"
import { transpileChat } from "../main/transpileChat"
import RoomForm from "../pm/parts/RoomForm"

export default class ReplyBuilder {
  public id: string
  public form: RoomForm
  private el: HTMLDivElement
  private username: HTMLParagraphElement
  private msg: HTMLParagraphElement
  private btnCancel: HTMLDivElement
  constructor(s: { id: string; form: RoomForm }) {
    this.id = s.id
    this.form = s.form
  }
  createElement(): void {
    this.username = kel("p", "username")
    this.msg = kel("p", "msg")
    const left = kel("div", "left", { e: [this.username, this.msg] })
    this.btnCancel = kel("div", "btn btn-cancel-rep", {
      e: '<i class="fa-duotone fa-circle-x"></i>'
    })
    const right = kel("div", "right", { e: this.btnCancel })
    const box = kel("div", "box", { e: [left, right] })

    this.el = kel("div", "embed", { e: box })
  }
  close(): void {
    this.el.remove()
    this.form.reply = null
  }
  clickHandler(): void {
    this.btnCancel.onclick = () => this.form.closeReply()
  }
  get html(): HTMLDivElement {
    return this.el
  }
  private init(): void {
    this.createElement()
    this.clickHandler()
    const target = this.form.room.field.list.get(this.id)?.json
    if (!target) return

    const { user, message } = target

    this.username.innerHTML = `<i class="fa-solid fa-reply"></i> ${user.username}`
    if (user.badges) setbadge(this.username, user.badges)
    this.msg.innerHTML = transpileChat(message, null, true)
  }
  run(): this {
    this.init()
    return this
  }
}
