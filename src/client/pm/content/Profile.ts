import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import { UserDB } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"
import { UserProfile } from "../../../server/types/profile.types"
import db from "../../manager/db"
import swiper from "../../manager/swiper"
import Room from "./Room"
import { RoomDetail } from "../../types/room.types"

export default class Profile implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  public user: UserDB
  private classBefore?: PrimaryClass
  constructor(s: { user: UserDB; classBefore?: PrimaryClass }) {
    this.id = "profile"
    this.isLocked = false
    this.user = s.user
    this.classBefore = s.classBefore
  }
  createElement(): void {
    this.el = kelement("div", "Profile pmcontent")
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
    // btn-chat
    const btnChat = <HTMLDivElement>this.el.querySelector(".btn-chat")
    btnChat.onclick = () => {
      const roomDetail: RoomDetail = {
        type: "user",
        id: this.user.id,
        name: {
          short: this.user.username,
          full: this.user.displayname
        }
      }
      if (this.user.badges) roomDetail.badges = this.user.badges
      if (this.user.image) roomDetail.img = this.user.image
      swiper(new Room({ data: roomDetail, users: [this.user] }), userState.currcontent)
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
  async actXhr(eoption: HTMLDivElement, ref: string, useconfirm?: string): Promise<{ ok: boolean; data?: { user: UserProfile } }> {
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
    const userData = (<unknown>setreq.data.user) as UserProfile
    this.user = userData
    const { isFriend } = userData

    const currChat = Object.values(db.c).find((k) => {
      return k.u.find((usr) => usr.id === this.user.id)
      // return db.c[k].u.find((usr) => usr.id === this.user.id)
    })
    const currUser = currChat?.u.find((usr) => usr.id === this.user.id)
    if (currUser) {
      currUser.isFriend = isFriend
      if (isFriend === 1 && db.me.req) {
        db.me.req = db.me.req.filter((usr) => usr.id !== userData.id)
        if (db.unread.r) db.unread.r = db.unread.r.filter((k) => k !== currUser.id)
      } else if (isFriend === 2) {
        db.me.req = (db.me.req || []).filter((usr) => usr.id !== userData.id)
      } else if (isFriend === 3) {
        if (!db.me.req) db.me.req = []
        db.me.req.push(userData)
      } else if (db.me.req) {
        db.me.req = db.me.req.filter((usr) => usr.id !== userData.id)
      }
    }

    this.isLocked = false
    this.renOptions()
    return { ok: true, data: { user: userData } }
  }
  actNotFriend(eoption: HTMLDivElement): void {
    const btn = kelement("div", "btn sb", { e: `<i class="fa-solid fa-user-plus"></i> ${lang.PROF_ADD}` })
    eoption.append(btn)
    btn.onclick = async () => this.actXhr(btn, "addfriend")
  }
  actFriend(eoption: HTMLDivElement): void {
    const btn = kelement("div", "btn sr", { e: `<i class="fa-solid fa-user-minus"></i> ${lang.PROF_UNFRIEND}` })
    btn.classList.add("btn", "sr")
    eoption.append(btn)
    btn.onclick = async () => this.actXhr(btn, "unfriend", "PROF_CONF_UNFRIEND")
  }
  actSent(eoption: HTMLDivElement): void {
    eoption.innerHTML = `<div class="note sy">${lang.PROF_WAIT}</div>`
    const btn = kelement("div", "btn sr", { e: `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_CANCEL}` })
    eoption.append(btn)
    btn.onclick = async () => this.actXhr(btn, "cancelfriend", "PROF_CONF_CANCEL")
  }
  actReceived(eoption: HTMLDivElement): void {
    const btn_a = kelement("div", "btn sg", { e: `<i class="fa-solid fa-user-check"></i> ${lang.PROF_ACCEPT}` })
    const btn_b = kelement("div", "btn sr", { e: `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_IGNORE}` })

    eoption.append(btn_a, btn_b)
    btn_a.onclick = async () => this.actXhr(btn_a, "acceptfriend")
    btn_b.onclick = async () => this.actXhr(btn_b, "ignorefriend", "PROF_CONF_IGNORE")
  }
  update(): void | Promise<void> {}
  async destroy(newer?: PrimaryClass): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime()
    this.isLocked = false
    this.el.remove()
    if (newer) newer.run()
  }
  run(): void {
    userState.content = this
    this.createElement()
    culement.app().append(this.el)
    this.writeDetail()
    this.renOptions()
    this.btnListener()
  }
}
