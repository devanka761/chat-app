import { kel } from "../helper/kel"
import { lang } from "../helper/lang"
import modal from "../helper/modal"
import adap from "../main/adaptiveState"
import Profile from "../pm/content/Profile"
import Room from "../pm/content/Room"
import { MessageOptionType } from "../types/message.types"
import MessageBuilder from "./MessageBuilder"

const innerBtn: { [key in MessageOptionType]: string } = {
  profile: '<i class="fa-duotone fa-regular fa-circle-user fa-fw"></i> {TEXT}',
  copy: '<i class="fa-duotone fa-regular fa-copy fa-fw"></i> {TEXT}',
  download: '<i class="fa-duotone fa-regular fa-download fa-fw"></i> {TEXT}',
  reply: '<i class="fa-duotone fa-regular fa-reply fa-fw"></i> {TEXT}',
  edit: '<i class="fa-duotone fa-regular fa-pen-to-square fa-fw"></i> {TEXT}',
  retry: '<i class="fa-regular fa-rotate-left fa-fw"></i> {TEXT}',
  delete: '<i class="fa-duotone fa-regular fa-trash-xmark fa-fw"></i> {TEXT}',
  cancel: '<i class="fa-duotone fa-regular fa-rectangle-xmark fa-fw"></i> {TEXT}'
}

export default class OptionMsgBuilder {
  private el: HTMLDivElement
  private msg: MessageBuilder
  private optype: MessageOptionType
  private room: Room
  constructor(s: { msg: MessageBuilder; optype: MessageOptionType; room: Room }) {
    this.msg = s.msg
    this.optype = s.optype
    this.room = s.room
  }
  createElement(): void {
    this.el = kel("div", `btn opt-${this.optype}`)
    this.el.innerHTML = innerBtn[this.optype].replace("{TEXT}", lang[`OPT_${this.optype}`])
  }
  private async clickHandler(): Promise<void> {
    switch (this.optype) {
      case "profile": {
        adap.swipe(new Profile({ user: this.msg.getUser(), classBefore: this.room }))
        break
      }
      case "download": {
        this.msg.saveAs()
        break
      }
      case "copy": {
        this.msg.copyText()
        break
      }
      case "reply": {
        this.room.form.setReply(this.msg.id)
        break
      }
      case "edit": {
        this.room.form.setEdit(this.msg.id)
        break
      }
      case "delete": {
        const confDelete = await modal.confirm({
          ic: "trash-can",
          msg: lang.CONTENT_WANT_TO_DELETE,
          okx: lang.CONTENT_CONFIRM_DELETE
        })
        if (!confDelete) {
          break
        }
        this.room.deleteMessage(this.msg.id)
        break
      }
      case "retry": {
        if (this.msg.raw) this.room.sendNewMessage(this.msg.raw, this.msg)
        break
      }
      case "cancel": {
        this.room.field.remove(this.msg)
        break
      }
    }
  }
  run() {
    this.createElement()
    this.el.onclick = () => {
      // this.msg.closeOptmenu()
      this.clickHandler()
    }
    return this.el
  }
}
