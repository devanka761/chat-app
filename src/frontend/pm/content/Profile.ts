import { epm, kel, qutor } from "../../helper/kel"
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
import FriendBuilder from "../props/friends/FriendBuilder"
import adap from "../../main/adaptiveState"
import VCall from "../parts/media/VCall"
import Tab from "../parts/header/Tab"
import { KirAIRoom } from "../../helper/AccountKirAI"

export default class Profile implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  user: IUserF
  private room?: Room
  private card?: FriendBuilder
  private wall: HTMLDivElement
  private actions: HTMLDivElement
  private options?: HTMLDivElement | null
  private btnBack: HTMLDivElement
  classBefore?: PrimaryClass
  private btnChat: HTMLDivElement
  private btnVoiceCall: HTMLDivElement
  private btnVideoCall: HTMLDivElement
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
  }
  writeTab(): void {
    this.btnBack = kel("div", "btn btn-back")
    this.btnBack.innerHTML = '<i class="fa-solid fa-arrow-left"></i>'
    const title = kel("div", "sect-title", { e: lang.APP_PROFILE })
    const tab = kel("div", "top", { e: [this.btnBack, title] })
    this.el.append(tab)
  }
  writeWall(): void {
    this.wall = kel("div", "wall")
    this.renDname()
    this.renImage()
    this.renUname()
    this.renBio()
    this.el.append(this.wall)
  }
  writeDetail(): void {
    this.writeTab()
    this.writeWall()
    this.renActions()
    if (this.user.id !== KirAIRoom.id) this.renOptions()
  }
  renImage(): void {
    let eimage = qutor(".img", this.wall)
    if (!eimage) eimage = kel("div", "chp img")
    if (!this.wall.contains(eimage)) this.wall.append(eimage)
    while (eimage.lastChild) eimage.lastChild.remove()
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    img.alt = this.user.username
    eimage.prepend(img)
  }
  renUname(): void {
    let euname = qutor(".username", this.wall)
    if (!euname) euname = kel("div", "chp username")
    if (!this.wall.contains(euname)) this.wall.append(euname)
    euname.innerHTML = this.user.username
    if (this.user.badges) setbadge(euname, this.user.badges)
  }
  renDname(): void {
    let edname = qutor(".displayname", this.wall)
    if (!edname) edname = kel("div", "chp displayname")
    if (!this.wall.contains(edname)) this.wall.append(edname)
    edname.innerText = this.user.displayname
  }
  renBio(): void {
    let ebio = qutor(".bio", this.wall)
    if (!ebio) ebio = kel("div", "chp bio")
    if (!this.wall.contains(ebio)) this.wall.append(ebio)
    let p = qutor("p", ebio)
    if (!p) p = kel("p")
    if (!ebio.contains(p)) ebio.append(p)
    p.innerText = this.user.bio || lang.ACC_NOBIO
  }
  btnListener(): void {
    this.btnBack.onclick = () => {
      if (this.isLocked) return
      adap.swipe(this.classBefore)
    }
    this.btnChat.onclick = () => {
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
    this.btnVoiceCall.onclick = async () => {
      const onMedia = userState.media || userState.incoming
      if (onMedia) {
        this.isLocked = true
        await modal.alert(lang.CALL_INCALL)
        this.isLocked = false
        return
      }
      if (this.user.id === KirAIRoom.id) {
        this.isLocked = true
        await modal.alert(lang.CALL_NOT_USER)
        this.isLocked = false
        return
      }
      if (this.user.isFriend !== 1) {
        this.isLocked = true
        await modal.alert(lang.PROF_ALR_NOFRIEND_1)
        this.isLocked = false
        return
      }
      const voiceCall = new VCall({ user: this.user })
      voiceCall.call()
    }
    this.btnVideoCall.onclick = async () => {
      const onMedia = userState.media || userState.incoming
      if (onMedia) {
        this.isLocked = true
        await modal.alert(lang.CALL_INCALL)
        this.isLocked = false
        return
      }
      if (this.user.id === KirAIRoom.id) {
        this.isLocked = true
        await modal.alert(lang.CALL_NOT_USER)
        this.isLocked = false
        return
      }
      if (this.user.isFriend !== 1) {
        this.isLocked = true
        await modal.alert(lang.PROF_ALR_NOFRIEND_1)
        this.isLocked = false
        return
      }
      const videoCall = new VCall({ user: this.user, video: true })
      videoCall.call()
    }
    if (this.user.id === KirAIRoom.id) {
      this.btnVoiceCall.remove()
      this.btnVideoCall.remove()
      return
    }
  }
  renActions(): void {
    this.btnChat = kel("div", "btn btn-chat")
    this.btnChat.innerHTML = `<i class="fa-solid fa-comment-dots"></i><span>${lang.PROF_BTN_CHAT}</span>`

    this.btnVoiceCall = kel("div", "btn btn-call")
    this.btnVoiceCall.innerHTML = `<i class="fa-solid fa-phone"></i><span>${lang.PROF_BTN_VOICE}</span>`

    this.btnVideoCall = kel("div", "btn btn-video")
    this.btnVideoCall.innerHTML = `<i class="fa-solid fa-video"></i><span>${lang.PROF_BTN_VIDEO}</span>`

    this.actions = kel("div", "chp actions", { e: [this.btnChat, this.btnVoiceCall, this.btnVideoCall] })
    this.wall.append(this.actions)
  }
  renOptions(): void {
    this.options = qutor(".options", this.wall) as HTMLDivElement | null
    if (!this.options) this.options = kel("div", "chp options")
    if (!this.wall.contains(this.options)) this.wall.append(this.options)
    this.clearOptions()
    if (!this.user.isFriend || this.user.isFriend === 0) return this.actNotFriend()
    if (this.user.isFriend === 1) return this.actFriend()
    if (this.user.isFriend === 2) return this.actSent()
    if (this.user.isFriend === 3) return this.actReceived()
  }
  clearOptions(): void {
    while (this.options && this.options.lastChild) this.options.lastChild.remove()
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

    const roottab = userState.tab as Tab | null
    if (roottab) roottab.update("friends")

    if (!userState.center) return
    if (userState.center.role === "friends") {
      const friendCenter = userState.center as Friends
      friendCenter.update(isFriend, s)
    }
  }
  actNotFriend(): void {
    const btn = kel("div", "btn sb", { e: `<i class="fa-solid fa-user-plus"></i> ${lang.PROF_ADD}` })
    this.options?.append(btn)
    btn.onclick = async () => this.actXhr(btn, "addfriend")
  }
  actFriend(): void {
    const btn = kel("div", "btn sr", { e: `<i class="fa-solid fa-user-minus"></i> ${lang.PROF_UNFRIEND}` })
    btn.classList.add("btn", "sr")
    this.options?.append(btn)
    btn.onclick = async () => this.actXhr(btn, "unfriend", "PROF_CONF_UNFRIEND")
  }
  actSent(): void {
    if (this.options) this.options.innerHTML = `<div class="note sy">${lang.PROF_WAIT}</div>`
    const btn = kel("div", "btn sr", { e: `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_CANCEL}` })
    this.options?.append(btn)
    btn.onclick = async () => this.actXhr(btn, "cancelfriend", "PROF_CONF_CANCEL")
  }
  actReceived(): void {
    const btn_a = kel("div", "btn sg", { e: `<i class="fa-solid fa-user-check"></i> ${lang.PROF_ACCEPT}` })
    const btn_b = kel("div", "btn sr", { e: `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_IGNORE}` })

    this.options?.append(btn_a, btn_b)
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
    epm().append(this.el)
    this.writeDetail()
    this.btnListener()
  }
}
