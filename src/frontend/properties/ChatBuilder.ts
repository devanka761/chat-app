import kelement from "../helper/kelement"
import sdate from "../helper/sdate"
import setbadge from "../helper/setbadge"
import { transpileChat } from "../main/transpileChat"
import userState from "../main/userState"
import swiper from "../manager/swiper"
import Room from "../pm/content/Room"
import { ChatDB, UserDB } from "../types/db.types"
import { RoomDetail } from "../types/room.types"

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

    this.lastchat = kelement("div", "last", { e: transpileChat(this.chat) })

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
    this.lastchat.innerHTML = transpileChat(chat)
    this.timestamp.innerHTML = sdate.dateOrTime(chat.timestamp)
  }
  get id(): string {
    return this.data.id
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.init()
    return this
  }
}
