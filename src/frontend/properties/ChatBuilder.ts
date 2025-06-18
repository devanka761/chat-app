import { kel } from "../helper/kel"
import sdate from "../helper/sdate"
import setbadge from "../helper/setbadge"
import { transpileChat } from "../main/transpileChat"
import userState from "../main/userState"
import swiper from "../manager/swiper"
import Room from "../pm/content/Room"
import { IMessageF, IRoomDataF, IUserF } from "../types/db.types"
import {} from "../types/room.types"

export default class ChatBuilder {
  private el: HTMLDivElement
  private data: IRoomDataF
  private users: IUserF[]
  private chat: IMessageF

  private img: HTMLImageElement
  private username: HTMLDivElement
  private lastchat: HTMLDivElement
  private eunread: HTMLDivElement
  private timestamp: HTMLDivElement
  private unread: number
  constructor({ data, users, chat }: { data: IRoomDataF; users: IUserF[]; chat: IMessageF }) {
    this.data = data
    this.users = users
    this.chat = chat
    this.unread = 0
  }
  private createElement(): void {
    this.el = kel("div", "card", { id: `chatlist-${this.data.id}` })

    this.img = new Image()
    this.img.alt = this.data.short
    this.img.onerror = () => (this.img.src = "/assets/user.jpg")
    this.img.src = this.data.image ? `/file/user/${this.data.image}` : "/assets/user.jpg"
    this.img.width = 50

    const ecimg = kel("div", "img")
    ecimg.append(this.img)

    this.username = kel("div", "name", { e: this.data.short })

    if (this.data.type === "user" && this.data.badges) {
      setbadge(this.username, this.data.badges)
    }

    this.lastchat = kel("div", "last", { e: transpileChat(this.chat) })

    const edetail = kel("div", "detail")
    edetail.append(this.username, this.lastchat)

    const eleft = kel("div", "left")
    eleft.append(ecimg, edetail)

    this.timestamp = kel("div", "last", { e: sdate.dateOrTime(this.chat.timestamp) })
    this.eunread = kel("div", "unread", { e: this.unread.toString() })

    const eright = kel("div", "right")
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
      if (userState.currcontent?.role === "room") {
        if (userState.currcontent.isLocked) return
        const room = userState.currcontent as Room
        if (room.key === this.data.id) return
      }
      const roomDetail: IRoomDataF = this.data
      if (this.data.badges) roomDetail.badges = this.data.badges
      if (this.data.image) roomDetail.image = this.data.image
      swiper(new Room({ data: roomDetail, users: this.users }), userState.currcontent)
    }
  }
  private init(): void {
    this.createElement()
    this.clickListener()
  }
  updateChat(chat: IMessageF): void {
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
