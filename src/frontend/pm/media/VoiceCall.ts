import { eroot, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import setbadge from "../../helper/setbadge"
import userState from "../../main/userState"
import { IUserF } from "../../types/db.types"

export default class VoiceCall {
  isLocked: boolean
  private el: HTMLDivElement
  user: IUserF
  private btnMinimize: HTMLDivElement
  private timestamp: HTMLDivElement
  private actInfo: HTMLDivElement
  private btnDeafen: HTMLDivElement
  private btnMute: HTMLDivElement
  private btnHangUp: HTMLDivElement
  private leftAct: HTMLDivElement
  private rightAct: HTMLDivElement
  constructor(s: { user: IUserF }) {
    this.user = s.user
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kel("div", "call")
  }
  private writeBackground(): void {
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    img.alt = this.user.username
    const profile_picture = kel("div", "profpic", { e: img })
    const bg = kel("div", "background", { e: profile_picture })
    this.el.append(bg)
  }
  writeTab(): void {
    const tab = kel("div", "top")
    this.el.append(tab)

    const detail = kel("div", "detail")
    this.actInfo = kel("div", "act-info")

    tab.append(detail, this.actInfo)

    this.btnMinimize = kel("div", "btn btn-minimize")
    this.btnMinimize.innerHTML = '<i class="fa-solid fa-chevron-down fa-fw"></i>'
    const caller = kel("div", "caller")
    const displayName = kel("div", "displayname")
    displayName.innerText = this.user.displayname
    if (this.user.badges) setbadge(displayName, this.user.badges)
    this.timestamp = kel("div", "ts", { e: lang.CALL_PREPARING })
    caller.append(displayName, this.timestamp)
    detail.append(this.btnMinimize, caller)
  }
  writeActions(): void {
    const bottom = kel("div", "bottom")
    this.el.append(bottom)

    const actList = kel("div", "act-list")
    bottom.append(actList)
    this.leftAct = kel("div", "call-act disabled")
    this.rightAct = kel("div", "call-act")
    actList.append(this.leftAct, this.rightAct)
    this.btnDeafen = kel("div", "btn btn-deafen", { e: '<i class="fa-solid fa-volume fa-fw"></i>' })
    this.btnMute = kel("div", "btn btn-mute", { e: '<i class="fa-solid fa-microphone fa-fw"></i>' })
    this.leftAct.append(this.btnDeafen, this.btnMute)
    this.btnHangUp = kel("div", "btn btn-hangup", { e: '<i class="fa-solid fa-phone-hangup fa-fw"></i>' })
    this.rightAct.append(this.btnHangUp)
  }
  private init(): void {
    this.createElement()
    eroot().append(this.el)
    this.writeBackground()
    this.writeTab()
    this.writeActions()
  }
  run(): this {
    userState.media = this
    this.init()
    return this
  }
}
