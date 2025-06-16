import kelement from "../helper/kelement"
import { lang } from "../helper/lang"
import { transpileChat } from "../main/transpileChat"
import RoomForm from "../pm/parts/RoomForm"

export default class EditBuilder {
  public id: string
  public form: RoomForm
  private el: HTMLDivElement
  private msg: HTMLParagraphElement
  private btnCancel: HTMLDivElement
  constructor(s: { id: string; form: RoomForm }) {
    this.id = s.id
    this.form = s.form
  }
  private createElement(): void {
    const desc = kelement("p", "username", { e: `<i class="fa-solid fa-pencil"></i> ${lang.CONTENT_EDIT}` })
    this.msg = kelement("p", "msg")
    const left = kelement("div", "left", { e: [desc, this.msg] })
    this.btnCancel = kelement("div", "btn btn-cancel-edit", {
      e: '<i class="fa-duotone fa-circle-x"></i>'
    })
    const right = kelement("div", "right", { e: this.btnCancel })
    const box = kelement("div", "box", { e: [left, right] })

    this.el = kelement("div", "embed embed-edit", { e: box })
  }
  clickHandler(): void {
    this.btnCancel.onclick = () => this.form.closeEdit()
  }
  get html(): HTMLDivElement {
    return this.el
  }
  close(): void {
    this.el.remove()
    this.form.edit = null
  }
  private init(): void {
    this.createElement()
    this.clickHandler()
    const target = this.form.room.list.get(this.id)?.json
    if (!target) return

    this.msg.innerHTML = transpileChat(target, null, true)
    this.form.setText(target.text || "")
  }
  run(): this {
    this.init()
    return this
  }
}
