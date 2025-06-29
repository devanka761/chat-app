import { eroot, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import setbadge from "../../helper/setbadge"
import { IUserF } from "../../types/db.types"

export default class Incoming {
  isLocked: boolean
  private el: HTMLDivElement
  private box: HTMLDivElement
  private btnAnswer: HTMLDivElement
  private btnDecline: HTMLDivElement
  private btnIgnore: HTMLDivElement
  user: IUserF
  constructor(s: { user: IUserF }) {
    this.isLocked = false
    this.user = s.user
  }
  createElement(): void {
    this.box = kel("div", "box")
    this.el = kel("div", "incoming")
    this.el.append(this.box)
  }
  writeCaller(): void {
    const caller = kel("div", "caller")
    this.box.append(caller)
    const eimg = kel("div", "img")

    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    img.alt = this.user.username
    eimg.append(img)

    const names = kel("div", "name")
    const displayname = kel("div", "displayname")
    displayname.innerText = this.user.displayname
    const username = kel("div", "username")
    username.innerText = "@" + this.user.username
    if (this.user.badges) setbadge(username, this.user.badges)

    names.append(displayname, username)

    caller.append(eimg, names)
  }
  writeCallType(): void {
    const callType = kel("div", "calltype fa-bounce", { a: { style: "--fa-animation-duration:4s" } })
    callType.innerHTML = `<p><i class="fa-solid fa-video fa-shake" style="--fa-animation-duration:2s"></i> <span>Incoming Video Call</span></p>`
    this.box.append(callType)
  }
  writeCallActions(): void {
    this.renCommits()
    this.renIgnore()
  }
  renCommits(): void {
    const callActions = kel("div", "callactions")
    this.btnDecline = kel("div", "btn btn-decline")
    this.btnDecline.innerHTML = `<i class="fa-solid fa-phone-hangup fa-fw"></i> ${lang.INCOMING_DECLINE}`
    this.btnAnswer = kel("div", "btn btn-answer")
    this.btnAnswer.innerHTML = `<i class="fa-solid fa-phone fa-fw"></i> ${lang.INCOMING_ANSWER}`
    callActions.append(this.btnDecline, this.btnAnswer)
    this.box.append(callActions)
  }
  renIgnore(): void {
    const callActions = kel("div", "callaction")
    this.btnIgnore = kel("div", "btn btn-ignore")
    this.btnIgnore.innerHTML = lang.INCOMING_IGNORE
    callActions.append(this.btnIgnore)
    this.box.append(callActions)
  }
  init(): void {
    this.createElement()
    eroot().append(this.el)
    this.writeCaller()
    this.writeCallType()
    this.writeCallActions()
  }
  run(): this {
    this.init()
    return this
  }
}
