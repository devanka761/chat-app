import { kel } from "../helper/kel"
import { lang } from "../helper/lang"
import sdate from "../helper/sdate"
import db from "../manager/db"
import { CallTypeF, IUserF } from "../types/db.types"

export default class CallMsgBuilder {
  private el: HTMLDivElement
  private user: IUserF
  private duration: number
  private type: CallTypeF
  private vcicon: HTMLDivElement
  private vctext: HTMLParagraphElement
  constructor(s: { user: IUserF; duration: number }) {
    this.user = s.user
    this.duration = s.duration
    this.run()
  }
  createElement(): void {
    this.vcicon = kel("div", "vc-icon")
    this.vctext = kel("p")
    const vctitle = kel("p", null, { e: "Voice Call" })
    const msg = kel("div", "vc-message", { e: [vctitle, this.vctext] })
    msg.append(this.vctext)
    this.el = kel("div", "chp vc", { e: [this.vcicon, msg] })
  }
  setType(): this {
    if (this.duration === -2) {
      this.type = "now"
    } else if (this.duration === -1) {
      this.type = "rejected"
    } else if (this.duration === 0) {
      this.type = "missed"
    } else if (this.duration >= 1) {
      this.type = db.me.id === this.user.id ? "outgoing" : "incoming"
    }
    this.el.classList.add("ct-" + this.type)
    if (this.type === "missed") {
      const isMe = db.me.id === this.user.id
      this.vctext.innerHTML = lang[isMe ? "CALL_MISSED_1" : "CALL_MISSED_2"]
    } else if (this.type === "rejected") {
      this.vctext.innerHTML = lang.CALL_REJECTED
    } else if (this.type === "incoming" || this.type === "outgoing") {
      this.vctext.innerHTML = sdate.durrTime(this.duration)
    } else {
      this.vctext.innerHTML = lang.CALL_NOW
    }
    return this
  }
  update(duration: number): this {
    this.duration = duration
    return this
  }
  init(): void {
    this.createElement()
    this.setType()
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.init()
    return this
  }
}
