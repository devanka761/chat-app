import kelement from "../helper/kelement"
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
    this.username = kelement("p", "username")
    this.msg = kelement("p", "msg")
    const left = kelement("div", "left", { e: [this.username, this.msg] })
    this.btnCancel = kelement("div", "btn btn-cancel-rep", {
      e: '<i class="fa-duotone fa-circle-x"></i>'
    })
    const right = kelement("div", "right", { e: this.btnCancel })
    const box = kelement("div", "box", { e: [left, right] })

    this.el = kelement("div", "embed", { e: box })
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
    const target = this.form.room.list.get(this.id)?.json
    if (!target) return

    const { user } = target

    this.username.innerHTML = user.username
    if (user.badges) setbadge(this.username, user.badges)
    this.msg.innerHTML = transpileChat(target, null, true)
  }
  run(): this {
    this.init()
    return this
  }
}
