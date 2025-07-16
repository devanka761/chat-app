import { kel } from "../../../helper/kel"
import setbadge from "../../../helper/setbadge"
import adap from "../../../main/adaptiveState"
import { transpileCall } from "../../../main/transpileChat"
import userState from "../../../main/userState"
import Calls from "../../../pm/center/Calls"
import Profile from "../../../pm/content/Profile"
import { IMessageF, IUserF } from "../../../types/db.types"

export default class CallBuilder {
  private el: HTMLDivElement
  user: IUserF
  private chat: IMessageF

  private img: HTMLImageElement
  private username: HTMLDivElement
  private lastcall: HTMLDivElement
  private parent?: Calls
  constructor(s: { user: IUserF; chat: IMessageF; parent?: Calls }) {
    this.user = s.user
    this.chat = s.chat
    this.parent = s.parent
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "card", { id: `chatlist-${this.chat.id}` })

    this.img = new Image()
    this.img.alt = this.user.username
    this.img.onerror = () => (this.img.src = `/assets/user.jpg`)
    this.img.src = this.user.image ? `/file/user/${this.user.image}` : `/assets/user.jpg`
    this.img.width = 50

    const ecimg = kel("div", "img")
    ecimg.append(this.img)

    this.username = kel("div", "name")
    this.username.innerText = this.user.username

    if (this.user.badges) {
      setbadge(this.username, this.user.badges)
    }

    this.lastcall = kel("div", "last", { e: transpileCall(this.chat) })

    const edetail = kel("div", "detail")
    edetail.append(this.username, this.lastcall)

    const eleft = kel("div", "left")
    eleft.append(ecimg, edetail)

    this.el.append(eleft)
  }
  updateLast(): void {
    // const oldtype = this.type
    // if (this.duration === -2) {
    //   this.type = "now"
    // } else if (this.duration === -1) {
    //   this.type = "rejected"
    // } else if (this.duration === 0) {
    //   this.type = "missed"
    // } else if (this.duration >= 1) {
    //   this.type = db.me.id === this.user.id ? "outgoing" : "incoming"
    // }
    // this.el.classList.remove("ct-" + oldtype)
    // this.el.classList.add("ct-" + this.type)
    // if (this.type === "missed") {
    //   const isMe = db.me.id === this.user.id
    //   this.vctext.innerHTML = lang[isMe ? "CALL_MISSED_1" : "CALL_MISSED_2"]
    // } else if (this.type === "rejected") {
    //   this.vctext.innerHTML = lang.CALL_REJECTED
    // } else if (this.type === "incoming" || this.type === "outgoing") {
    //   this.vctext.innerHTML = sdate.durrTime(this.duration)
    // } else {
    //   this.vctext.innerHTML = lang.CALL_NOW
    // }
  }
  private clickListener(): void {
    this.el.onclick = () => {
      if (userState.content?.role === "profile") {
        const profile = userState.content as Profile
        if (profile.user.id === this.user.id) return
      }
      adap.swipe(new Profile({ user: this.user, classBefore: this.parent }))
    }
  }
  private init(): void {
    this.createElement()
    this.clickListener()
  }
  get id(): string {
    return this.user.id
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.init()
    return this
  }
}
