import { epm, kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import setbadge from "../../../helper/setbadge"
import waittime from "../../../helper/waittime"
import userState from "../../../main/userState"
import socketClient from "../../../manager/socketClient"
import { IUserF } from "../../../types/db.types"
import { ICallUpdateF } from "../../../types/peer.types"
import VCall from "./VCall"

export default class Incoming {
  isLocked: boolean
  private el: HTMLDivElement
  private box: HTMLDivElement
  private btnAnswer: HTMLDivElement
  private btnDecline: HTMLDivElement
  private btnIgnore: HTMLDivElement
  user: IUserF
  private data: ICallUpdateF
  constructor(s: { data: ICallUpdateF }) {
    this.isLocked = false
    this.user = s.data.user
    this.data = s.data
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

    const icname = this.data.video ? "video" : "phone-volume"
    const ictitle = this.data.video ? lang.INC_VIDEO : lang.INC_VOICE

    callType.innerHTML = `<p><i class="fa-solid fa-${icname} fa-shake" style="--fa-animation-duration:2s"></i> <span>${ictitle}</span></p>`
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
  btnListener(): void {
    this.el.onclick = async (e) => {
      if (e.target instanceof Node === false) return
      if (this.btnIgnore.contains(e.target)) {
        this.el.classList.add("out")
        await waittime(190)
        this.el.classList.remove("out")
        this.el.classList.add("ignored")
      } else if (this.btnAnswer.contains(e.target)) {
        this.destroy()
        const vcall = new VCall({ user: this.user, video: this.data.video })
        vcall.answer(this.data.sdp, this.data.callKey)
      } else if (this.btnDecline.contains(e.target)) {
        this.destroy()
        socketClient.send({ type: "reject", to: this.user.id, callKey: this.data.callKey })
      } else {
        if (this.el.classList.contains("ignored")) {
          this.el.classList.add("out")
          await waittime(190)
          this.el.classList.remove("out")
          this.el.classList.remove("ignored")
        }
      }
    }
  }
  init(): void {
    this.createElement()
    epm().append(this.el)
    this.writeCaller()
    this.writeCallType()
    this.writeCallActions()
    this.btnListener()
  }
  destroy(): void {
    this.el.remove()
    userState.incoming = null
  }
  run(): this {
    userState.incoming = this
    this.init()
    return this
  }
}
