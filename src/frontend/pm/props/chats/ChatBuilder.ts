import { kel } from "../../../helper/kel"
import sdate from "../../../helper/sdate"
import setbadge from "../../../helper/setbadge"
import adap from "../../../main/adaptiveState"
import { transpileChat } from "../../../main/transpileChat"
import userState from "../../../main/userState"
import Chats from "../../../pm/center/Chats"
import Room from "../../../pm/content/Room"
import { IMessageF, IRoomDataF, IUserF } from "../../../types/db.types"

export default class ChatBuilder {
  private el: HTMLDivElement
  data: IRoomDataF
  users: IUserF[]
  private chat: IMessageF

  private img: HTMLImageElement
  private username: HTMLDivElement
  private lastchat: HTMLDivElement
  private eunread: HTMLDivElement
  private eright: HTMLDivElement
  private timestamp: HTMLDivElement
  unread: number
  private parent?: Chats
  constructor(s: { data: IRoomDataF; users: IUserF[]; chat: IMessageF; parent?: Chats }) {
    this.data = s.data
    this.users = s.users
    this.chat = s.chat
    this.unread = 0
    this.parent = s.parent
  }
  private createElement(): void {
    this.el = kel("div", "card", { id: `chatlist-${this.data.id}` })

    const folder = this.data.type === "user" ? "user" : "group"
    this.img = new Image()
    this.img.alt = this.data.short
    this.img.onerror = () => (this.img.src = `/assets/${folder}.jpg`)
    this.img.src = this.data.image ? `/file/${folder}/${this.data.image}` : `/assets/${folder}.jpg`
    this.img.width = 50

    const ecimg = kel("div", "img")
    ecimg.append(this.img)

    this.username = kel("div", "name")
    this.username.innerText = this.data.short

    if (this.data.badges) {
      setbadge(this.username, this.data.badges)
    }

    const lastUser = this.data.type === "group" ? this.users.find((usr) => usr.id === this.chat.userid) : undefined

    this.lastchat = kel("div", "last", { e: transpileChat(this.chat, lastUser) })

    const edetail = kel("div", "detail")
    edetail.append(this.username, this.lastchat)

    const eleft = kel("div", "left")
    eleft.append(ecimg, edetail)

    this.timestamp = kel("div", "last", { e: sdate.dateOrTime(this.chat.timestamp) })
    this.eunread = kel("div", "unread", { e: this.unread.toString() })

    this.eright = kel("div", "right")
    this.eright.append(this.timestamp)
    if (this.unread >= 1) this.eright.append(this.eunread)

    this.el.append(eleft, this.eright)
  }
  updateData(newData: IRoomDataF): void {
    const folder = this.data.type

    if (newData.image) {
      this.data.image = newData.image
      this.img.src = `/file/${folder}/${this.data.image}`
    }

    if (newData.short) {
      this.data.short = newData.short
      this.username.innerText = this.data.short
      if (this.data.badges) {
        setbadge(this.username, this.data.badges)
      }
    }
  }
  addUnread(n?: number): this {
    this.unread = this.unread + (n || 1)
    if (this.eright && !this.eright.contains(this.eunread)) {
      this.eright.append(this.eunread)
    }
    this.eunread.innerHTML = this.unread.toString()
    return this
  }
  setUnread(n: number): this {
    this.unread = n
    if (this.unread >= 1 && this.eright) {
      if (!this.eright.contains(this.eunread)) {
        this.eright.append(this.eunread)
      }
      this.eunread.innerHTML = this.unread.toString()
    } else if (this.eright) {
      if (this.eright.contains(this.eunread)) this.eright.removeChild(this.eunread)
    }
    return this
  }
  private clickListener(): void {
    this.el.onclick = () => {
      if (userState.content?.role === "room") {
        if (userState.content.isLocked) return
        const room = userState.content as Room
        if (room.key === this.data.id) return
      }
      const roomDetail: IRoomDataF = this.data
      if (this.data.badges) roomDetail.badges = this.data.badges
      if (this.data.image) roomDetail.image = this.data.image
      adap.swipe(new Room({ data: roomDetail, users: this.users, classBefore: this.parent }))
    }
  }
  private init(): void {
    this.createElement()
    this.clickListener()
  }
  updateChat(chat: IMessageF, roomdata: IRoomDataF): void {
    const lastUser = this.data.type === "group" ? this.users.find((usr) => usr.id === chat.userid) : undefined
    if (roomdata.image && roomdata.image !== this.data.image) {
      this.data.image = roomdata.image
    }
    this.lastchat.innerHTML = transpileChat(chat, lastUser)
    this.timestamp.innerHTML = sdate.dateOrTime(chat.timestamp)
  }
  hide(): void {
    this.el.classList.add("hidden")
  }
  show(): void {
    this.el.classList.remove("hidden")
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
