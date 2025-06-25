import { eroot, kel } from "../../helper/kel"
import modal from "../../helper/modal"
import noUser from "../../helper/noUser"
import userState from "../../main/userState"
import db from "../../manager/db"
import { IChatsF, IMessageF, IRoomDataF, IUserF } from "../../types/db.types"
import { TStatusText } from "../../types/room.types"
import { PrimaryClass } from "../../types/userState.types"
import RoomField from "../parts/RoomField"
import RoomForm from "../parts/RoomForm"
import { IMessageUpdateF, IWritterF } from "../../types/message.types"
import MessageBuilder from "../../properties/MessageBuilder"
import { convertMessage, msgValidTypes } from "../../helper/helper"
import xhr from "../../helper/xhr"
import { IRepB } from "../../../backend/types/validate.types"
import { lang } from "../../helper/lang"
import RoomRecorder from "../parts/RoomRecorder"
import RoomTab from "../parts/RoomTab"
import FriendBuilder from "../../properties/FriendBuilder"

export default class Room implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  readonly id: string
  private el: HTMLDivElement
  data: IRoomDataF
  private chats?: IChatsF
  private users: IUserF[]
  private top: HTMLDivElement
  private middle: HTMLDivElement
  private bottom: HTMLDivElement
  form: RoomForm
  recorder: RoomRecorder
  field: RoomField
  tab: RoomTab
  opt?: HTMLDivElement
  optRetrying?: HTMLDivElement
  mediaToLoad: number
  private card?: FriendBuilder
  private btnBack: HTMLDivElement
  classBefore?: PrimaryClass
  constructor(s: { data: IRoomDataF; users: IUserF[]; chats?: IChatsF; card?: FriendBuilder; classBefore?: PrimaryClass }) {
    this.king = "content"
    this.role = "room"
    this.isLocked = false
    this.users = s.users
    this.chats = s.chats
    this.data = s.data
    this.card = s.card
    this.id = s.data.id
    this.classBefore = s.classBefore
    this.form = new RoomForm({ room: this })
    this.field = new RoomField({ room: this })
    this.tab = new RoomTab({ data: s.data, room: this, users: s.users, card: s.card, classBefore: s.classBefore })
    this.recorder = new RoomRecorder({ room: this })
    this.mediaToLoad = 1
  }
  private createElement(): void {
    this.top = kel("div", "top")
    this.middle = kel("div", "mid")
    this.bottom = kel("div", "bottom")

    this.el = kel("div", "Room pmcontent", { e: [this.top, this.middle, this.bottom] })
  }
  private writeData(): void {
    this.writeTab()
    this.writeForm()
    this.writeField()
  }
  private writeTab(): void {
    this.tab.run(this.top)
  }
  private writeForm(): void {
    this.form.run(this.bottom)
  }
  private writeField(): void {
    this.field.run(this.middle)
    const collection = db.c
    const chats = collection.find((ch) => ch.r.id === this.data.id)
    if (chats) {
      chats.m.forEach((ch) => {
        const user: IUserF = ch.userid === db.me.id ? db.me : chats.u.find((usr) => usr.id === ch.userid) || noUser()
        if (msgValidTypes.find((ity) => ity === ch.type)) {
          this.mediaToLoad++
        }
        const message = new MessageBuilder(ch, user, this)
        this.field.send(message.run())
        if (ch.userid === db.me.id) {
          if (this.data.type === "user" && ch.readers?.includes(this.data.id)) {
            message.setStatus("read")
          } else {
            message.setStatus("sent")
          }
        }
      })
    }
    this.checkIfMediaReady()
  }
  checkIfMediaReady(): void {
    if (this.mediaToLoad < 0) return
    this.mediaToLoad--
    if (this.mediaToLoad === 0) {
      this.field.scrollToBottom()
      this.mediaToLoad = 1
    }
  }
  resizeMiddle(formHeight: number): void {
    this.bottom.style.height = `${formHeight}px`
    this.middle.style.height = `calc(100% - (60px + ${formHeight}px))`
  }
  async sendMessage(s: IWritterF): Promise<IRepB> {
    await modal.waittime(1000)
    return await xhr.post(`/x/room/sendMessage/${this.data.type}/${this.data.id}`, s)
  }
  async sendNewMessage(s: IWritterF, message: MessageBuilder): Promise<void> {
    message.setStatus("pending")
    this.field.html.append(message.html)
    message.html.scrollIntoView()
    const messageSent = await this.sendMessage(s)
    if (!messageSent || !messageSent.ok) {
      message.setStatus("failed")
      this.isLocked = true
      if (messageSent.code === 413) {
        await modal.alert(lang[messageSent.msg]?.replace("{SIZE}", "2 MB") || lang.ERROR)
      }
      this.isLocked = false
      return
    }
    const msg: IMessageF = messageSent.data.chat
    message.setTimeStamp(msg.timestamp)
    message.update(msg)
    message.setStatus("sent")
    message.clickListener()
    this.processUpdate(messageSent.data)
  }
  async createNewMessage(s: IWritterF): Promise<void> {
    const msg = { ...convertMessage(db.me.id, s), id: Date.now().toString(36) }
    const message: MessageBuilder = new MessageBuilder(msg, db.me, this, s)
    this.field.send(message.run(true))
    this.sendNewMessage(s, message)
  }
  async sendEditedMessage(s: IWritterF): Promise<void> {
    if (!s.edit) return
    const message: MessageBuilder | null = this.field.list.get(s.edit)
    if (!message) return
    if (message.json.message.text === s.text) return
    message.html.scrollIntoView()
    const currStatus = message.currentStatus?.toString()
    message.setStatus("pending")
    const messageSent = await this.sendMessage(s)
    if (!messageSent || !messageSent.ok) {
      message.setStatus("failed")
      this.isLocked = true
      await modal.alert(lang[messageSent.msg] || lang.ERROR)
      this.isLocked = false
      message.setStatus((currStatus || "sent") as TStatusText)
      message.setTimeStamp(message.json.message.timestamp)
      message.clickListener()
      return
    }
    const msg: IMessageF = messageSent.data.chat
    message.setTimeStamp(msg.timestamp)
    message.setText(msg.text as string)
    message.setStatus("sent")
    message.setEdited(msg.edited)
    message.clickListener()
    this.processUpdate(messageSent.data)
  }
  async sendWritter(s: IWritterF): Promise<void> {
    if (s.edit) return await this.sendEditedMessage(s)
    return await this.createNewMessage(s)
  }
  processUpdate(s: IMessageUpdateF): void {
    let dbchat = db.c.find((k) => k.r.id === this.data.id)
    if (!dbchat) {
      db.c.push({
        m: [],
        r: this.data,
        u: this.users
      })
    }
    dbchat = db.c.find((k) => k.r.id === this.data.id)
    if (dbchat) {
      const oldDB = dbchat.m.find((ch) => ch.id === s.chat.id)
      if (oldDB) {
        oldDB.text = s.chat.text
        oldDB.edited = s.chat.edited
      } else {
        dbchat.m.push(s.chat)
      }
    }
    if (userState.center?.role === "chats") {
      if (dbchat && dbchat.m[dbchat.m.length - 1].id !== s.chat.id) return
      userState.center.update({
        chat: s.chat,
        users: this.users,
        roomid: s.roomid,
        isFirst: s.isFirst,
        roomdata: this.data
      })
    }
  }
  async deleteMessage(msgid: string): Promise<void> {
    const message = this.field.list.get(msgid)
    if (!message) return
    const currStatus = message.currentStatus?.toString()
    message.setStatus("pending")

    const messageDeleted = await xhr.post(`/x/room/delMessage/${this.data.type}/${this.data.id}/${msgid}`)
    if (!messageDeleted || !messageDeleted.ok) {
      this.isLocked = true
      message.setStatus("failed")
      await modal.alert(lang[messageDeleted.msg] || lang.ERROR)
      message.setTimeStamp(message.json.message.timestamp)
      message.setStatus((currStatus || "sent") as TStatusText)
      message.clickListener()
      this.isLocked = false
      return
    }
    message.deleted = true
    this.processUpdate(messageDeleted.data)
  }
  update(): void | Promise<void> {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  get key(): string {
    return this.data.id
  }
  run(): void {
    userState.content = this
    this.createElement()
    eroot().append(this.el)
    this.writeData()
  }
}
