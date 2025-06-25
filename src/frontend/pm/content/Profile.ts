import { eroot, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import { IRoomDataF, IUserF } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"
import db from "../../manager/db"
import Room from "./Room"
import Friends from "../center/Friends"
import FriendBuilder from "../../properties/FriendBuilder"
import adap from "../../main/adaptiveState"

export default class Profile implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  user: IUserF
  private room?: Room
  private card?: FriendBuilder
  private btnBack: HTMLDivElement
  classBefore?: PrimaryClass
  constructor(s: { user: IUserF; room?: Room; card?: FriendBuilder; classBefore?: PrimaryClass }) {
    this.king = "content"
    this.role = "profile"
    this.isLocked = false
    this.user = s.user
    this.room = s.room
    this.card = s.card
    this.classBefore = s.classBefore
  }
  createElement(): void {
    this.el = kel("div", "Profile pmcontent")
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">${lang.APP_PROFILE}</div>
    </div>
    <div class="wall">
      <div class="chp displayname"><p></p></div>
      <div class="chp img">
      </div>
      <div class="chp username"><p></p></div>
      <div class="chp bio"><p></p></div>
      <div class="chp actions">
        <div class="btn btn-chat"><i class="fa-solid fa-comment-dots"></i><p>${lang.PROF_BTN_CHAT}</p></div>
        <div class="btn btn-call"><i class="fa-solid fa-phone"></i><p>${lang.PROF_BTN_VOICE}</p></div>
        <div class="btn btn-video"><i class="fa-solid fa-video"></i><p>${lang.PROF_BTN_VIDEO}</p></div>
      </div>
      <div class="chp options">
      </div>
    </div>`
    this.btnBack = this.el.querySelector(".btn-back") as HTMLDivElement
  }
  writeDetail(): void {
    this.renImage()
    this.renUname()
    this.renDname()
    this.renBio()
  }
  renImage(): void {
    const eimage = <HTMLDivElement>this.el.querySelector(".wall .img")
    if (eimage.lastChild) eimage.lastChild.remove()
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    img.alt = this.user.username
    eimage.prepend(img)
  }
  renUname(): void {
    const euname = <HTMLParagraphElement>this.el.querySelector(".wall .username p")
    euname.innerHTML = this.user.username
    if (this.user.badges) setbadge(euname, this.user.badges)
  }
  renDname(): void {
    const edname = <HTMLParagraphElement>this.el.querySelector(".wall .displayname p")
    edname.innerText = this.user.displayname
  }
  renBio(): void {
    const ebio = <HTMLParagraphElement>this.el.querySelector(".wall .bio p")
    ebio.innerText = this.user.bio || lang.ACC_NOBIO
  }
  btnListener(): void {
    this.btnBack.onclick = () => adap.swipe(this.classBefore)
    const btnChat = <HTMLDivElement>this.el.querySelector(".btn-chat")
    btnChat.onclick = () => {
      const roomDetail: IRoomDataF = {
        id: this.user.id,
        long: this.user.displayname,
        short: this.user.username,
        type: "user",
        badges: this.user.badges,
        image: this.user.image
      }
      const classBefore = this.classBefore?.role === "room" ? this.classBefore.classBefore : this
      adap.swipe(new Room({ data: roomDetail, users: [this.user], card: this.card, classBefore }))
    }
  }
  clearOptions(eoptions: HTMLDivElement): void {
    while (eoptions.lastChild) eoptions.lastChild.remove()
  }
  renOptions(): void {
    const eoption = <HTMLDivElement>this.el.querySelector(".wall .options")
    this.clearOptions(eoption)
    if (!this.user.isFriend || this.user.isFriend === 0) return this.actNotFriend(eoption)
    if (this.user.isFriend === 1) return this.actFriend(eoption)
    if (this.user.isFriend === 2) return this.actSent(eoption)
    if (this.user.isFriend === 3) return this.actReceived(eoption)
  }
  async actXhr(eoption: HTMLDivElement, ref: string, useconfirm?: string): Promise<{ ok: boolean; data?: { user: IUserF } }> {
    if (this.isLocked) return { ok: false }
    this.isLocked = true

    if (useconfirm) {
      const isConfirm = await modal.confirm(lang[useconfirm].replace(/{user}/g, this.user.username))
      if (!isConfirm) {
        this.isLocked = false
        return { ok: false }
      }
    }

    eoption.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`
    await modal.waittime(1000)
    const setreq = await xhr.post(`/x/profile/${ref}`, { userid: this.user.id })
    if (!setreq?.data?.user) {
      this.renOptions()
      await modal.alert(lang[setreq.msg] || lang.ERROR)
      this.isLocked = false
      return { ok: false }
    }
    const userData = setreq.data.user as IUserF
    this.user = userData
    const { isFriend } = userData
    this.user.isFriend = isFriend
    if (this.card) this.card.user.isFriend = isFriend

    if (db.me.req) {
      if (isFriend === 1) {
        db.me.req = db.me.req.filter((usr) => usr.id !== userData.id)
      } else if (isFriend === 2) {
        db.me.req = db.me.req.filter((usr) => usr.id !== userData.id)
      } else if (isFriend === 3) {
        db.me.req.push(userData)
      } else {
        db.me.req = db.me.req.filter((usr) => usr.id !== userData.id)
      }
    } else if (isFriend === 3) {
      db.me.req = []
      db.me.req.push(userData)
    }

    this.processChatReq(isFriend || 0, setreq.data)

    this.isLocked = false
    this.renOptions()
    return { ok: true, data: { user: userData } }
  }
  processChatReq(isFriend: number, s: { user: IUserF; room: IRoomDataF }): void {
    let currChat = db.c.find((ch) => ch.r.id === s.user.id)
    if (!currChat && isFriend === 1) {
      db.c.push({
        r: s.room,
        u: [s.user],
        m: []
      })
    }
    currChat = db.c.find((ch) => ch.r.id === s.user.id)
    const currUser = currChat?.u.find((usr) => usr.id === s.user.id)
    if (currChat && currUser) currUser.isFriend = isFriend

    if (!userState.center) return
    if (userState.center.role === "friends") {
      const friendCenter = userState.center as Friends
      friendCenter.update(isFriend, s)
    }
  }
  actNotFriend(eoption: HTMLDivElement): void {
    const btn = kel("div", "btn sb", { e: `<i class="fa-solid fa-user-plus"></i> ${lang.PROF_ADD}` })
    eoption.append(btn)
    btn.onclick = async () => this.actXhr(btn, "addfriend")
  }
  actFriend(eoption: HTMLDivElement): void {
    const btn = kel("div", "btn sr", { e: `<i class="fa-solid fa-user-minus"></i> ${lang.PROF_UNFRIEND}` })
    btn.classList.add("btn", "sr")
    eoption.append(btn)
    btn.onclick = async () => this.actXhr(btn, "unfriend", "PROF_CONF_UNFRIEND")
  }
  actSent(eoption: HTMLDivElement): void {
    eoption.innerHTML = `<div class="note sy">${lang.PROF_WAIT}</div>`
    const btn = kel("div", "btn sr", { e: `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_CANCEL}` })
    eoption.append(btn)
    btn.onclick = async () => this.actXhr(btn, "cancelfriend", "PROF_CONF_CANCEL")
  }
  actReceived(eoption: HTMLDivElement): void {
    const btn_a = kel("div", "btn sg", { e: `<i class="fa-solid fa-user-check"></i> ${lang.PROF_ACCEPT}` })
    const btn_b = kel("div", "btn sr", { e: `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_IGNORE}` })

    eoption.append(btn_a, btn_b)
    btn_a.onclick = async () => this.actXhr(btn_a, "acceptfriend")
    btn_b.onclick = async () => this.actXhr(btn_b, "ignorefriend", "PROF_CONF_IGNORE")
  }
  update(): void | Promise<void> {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    eroot().append(this.el)
    this.writeDetail()
    this.renOptions()
    this.btnListener()
  }
}
