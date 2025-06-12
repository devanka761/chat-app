import { escapeHTML, ss } from "../helper/escaper"
import kelement from "../helper/kelement"
import { lang } from "../helper/lang"
import sdate from "../helper/sdate"
import setbadge from "../helper/setbadge"
import userState from "../main/userState"
import db from "../manager/db"
import swiper from "../manager/swiper"
import Room from "../pm/content/Room"
import { ChatDB, UserDB } from "../types/db.types"
import { RoomDetail } from "../types/room.types"

const mediaIcons: { [key: string]: string } = {
  file: '<i class="fa-light fa-file"></i>',
  image: '<i class="fa-light fa-image"></i>',
  video: '<i class="fa-light fa-film"></i>',
  audio: '<i class="fa-light fa-music"></i>'
}

function transpile_lastchat(s: ChatDB, lastuser?: UserDB): string {
  const myId = <string>db.me.id
  let text = ""
  if (lastuser) text = `${ss(lastuser.username, 10)} <i class="fa-regular fa-angle-right"></i> `

  if (s.type === "deleted") {
    text += `<i class="fa-solid fa-ban"></i> <i>${s.userid === myId ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}</i>`
    return text
  }

  if (s.type === "call") {
    text += `<i class="fa-solid fa-phone-volume"></i> Voice Call`
    return text
  } else if (s.type === "image" || s.type === "video" || s.type === "file") {
    text += `${mediaIcons[s.type]} ${s.text ? escapeHTML(lastuser ? ss(<string>s.text, 9) : ss(<string>s.text, 19)) : "Media"}`
  } else if (s.type === "voice") {
    text += `<i class="fa-light fa-microphone"></i> Voice Chat`
  } else {
    text += escapeHTML(lastuser ? ss(<string>s.text, 10) : ss(<string>s.text))
  }

  if (s.userid === myId) {
    const isRead: boolean = (s.readers || []).filter((usrid) => usrid !== myId)?.length >= 1
    text = `<i class="fa-regular fa-check${isRead ? "-double" : ""}"></i> ` + text
  }

  return text
}

export default class ChatBuilder {
  private el: HTMLDivElement
  private data: RoomDetail
  private users: UserDB[]
  private chat: ChatDB

  private img: HTMLImageElement
  private username: HTMLDivElement
  private lastchat: HTMLDivElement
  private eunread: HTMLDivElement
  private timestamp: HTMLDivElement
  private unread: number
  constructor({ data, users, chat }: { data: RoomDetail; users: UserDB[]; chat: ChatDB }) {
    this.data = data
    this.users = users
    this.chat = chat
    this.unread = 0
  }
  private createElement(): void {
    this.el = kelement("div", "card", { id: `chatlist-${this.data.id}` })

    this.img = new Image()
    this.img.alt = this.data.name.short
    this.img.onerror = () => (this.img.src = "/assets/user.jpg")
    this.img.src = this.data.img ? `/file/user/${this.data.img}` : "/assets/user.jpg"
    this.img.width = 50

    const ecimg = kelement("div", "img")
    ecimg.append(this.img)

    this.username = kelement("div", "name", { e: this.data.name.short })

    if (this.data.type === "user" && this.data.badges) {
      setbadge(this.username, this.data.badges)
    }

    this.lastchat = kelement("div", "last", { e: transpile_lastchat(this.chat) })

    const edetail = kelement("div", "detail")
    edetail.append(this.username, this.lastchat)

    const eleft = kelement("div", "left")
    eleft.append(ecimg, edetail)

    this.timestamp = kelement("div", "last", { e: sdate.dateOrTime(this.chat.timestamp) })
    this.eunread = kelement("div", "unread", { e: this.unread.toString() })

    const eright = kelement("div", "right")
    eright.append(this.timestamp)
    if (this.unread >= 1) eright.append(this.eunread)

    this.el.append(eleft, eright)
  }
  addUnread(n?: number): this {
    this.unread = this.unread + (n || 1)
    if (this.eunread) this.eunread.innerHTML = this.unread.toString()
    return this
  }
  setUnread(n: number): this {
    this.unread = n
    if (this.eunread) this.eunread.innerHTML = this.unread.toString()
    return this
  }
  private clickListener(): void {
    this.el.onclick = () => {
      if (userState.currcontent?.id === "room") {
        if (userState.currcontent.isLocked) return
        const room = userState.currcontent as Room
        if (room.key === this.data.id) return
      }
      const roomDetail: RoomDetail = this.data
      if (this.data.badges) roomDetail.badges = this.data.badges
      if (this.data.img) roomDetail.img = this.data.img
      swiper(new Room({ data: roomDetail, users: this.users }), userState.currcontent)
    }
  }
  private init(): void {
    this.createElement()
    this.clickListener()
  }
  updateChat(chat: ChatDB): void {
    this.lastchat.innerHTML = transpile_lastchat(chat)
    this.timestamp.innerHTML = sdate.dateOrTime(chat.timestamp)
  }
  get id(): string {
    return this.data.id
  }
  toHTML(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.init()
    return this
  }
}
