import { kel } from "../helper/kel"
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
    const desc = kel("p", "username", { e: `<i class="fa-solid fa-pencil"></i> ${lang.CONTENT_EDIT}` })
    this.msg = kel("p", "msg")
    const left = kel("div", "left", { e: [desc, this.msg] })
    this.btnCancel = kel("div", "btn btn-cancel-edit", {
      e: '<i class="fa-duotone fa-circle-x"></i>'
    })
    const right = kel("div", "right", { e: this.btnCancel })
    const box = kel("div", "box", { e: [left, right] })

    this.el = kel("div", "embed embed-edit", { e: box })
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
    const target = this.form.room.field.list.get(this.id)?.json
    if (!target) return
    const { message } = target

    this.msg.innerHTML = transpileChat(message, null, true)
    this.form.setText(message.text || "")
  }
  run(): this {
    this.init()
    return this
  }
}
