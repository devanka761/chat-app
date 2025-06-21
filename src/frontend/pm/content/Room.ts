import { eroot, kel } from "../../helper/kel"
import modal from "../../helper/modal"
import noUser from "../../helper/noUser"
import setbadge from "../../helper/setbadge"
import userState from "../../main/userState"
import db from "../../manager/db"
import swiper from "../../manager/swiper"
import { IChatsF, IMessageF, IRoomDataF, IUserF } from "../../types/db.types"
import { TStatusText } from "../../types/room.types"
import { PrimaryClass } from "../../types/userState.types"
import RoomField from "../parts/RoomField"
import RoomForm from "../parts/RoomForm"
import Profile from "./Profile"
import { IMessageUpdateF, IWritterF } from "../../types/message.types"
import MessageBuilder from "../../properties/MessageBuilder"
import { convertMessage, msgValidTypes } from "../../helper/helper"
import xhr from "../../helper/xhr"
import { IRepB } from "../../../backend/types/validate.types"
import { lang } from "../../helper/lang"
import RoomRecorder from "../parts/RoomRecorder"
import Group from "./Group"

export default class Room implements PrimaryClass {
  readonly role: string
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  public data: IRoomDataF
  private chats?: IChatsF
  private users: IUserF[]
  private middle: HTMLDivElement
  private bottom: HTMLDivElement
  public form: RoomForm
  public recorder: RoomRecorder
  public field: RoomField
  public opt?: HTMLDivElement
  public optRetrying?: HTMLDivElement
  public mediaToLoad: number
  constructor(s: { data: IRoomDataF; users: IUserF[]; chats?: IChatsF }) {
    this.role = "room"
    this.isLocked = false
    this.users = s.users
    this.chats = s.chats
    this.data = s.data
    this.id = s.data.id
    this.form = new RoomForm({ room: this })
    this.field = new RoomField({ room: this })
    this.recorder = new RoomRecorder({ room: this })
    this.mediaToLoad = 1
  }
  private createElement(): void {
    this.el = kel("div", "Room pmcontent")
    this.el.innerHTML = `
    <div class="top">
      <div class="left">
        <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="user">
          <div class="img"></div>
          <div class="names"><p class="uname"></p><p class="dname"></p></div>
        </div>
      </div>
      <div class="right">
        <div class="btn btn-video">
          <i class="fa-solid fa-video"></i>
        </div>
        <div class="btn btn-call">
          <i class="fa-solid fa-phone"></i>
        </div>
        <div class="btn btn-more">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>
    </div>
    <div class="mid">
    </div>
    <div class="bottom">
    </div>`
    this.middle = <HTMLDivElement>this.el.querySelector(".mid")
    this.bottom = <HTMLDivElement>this.el.querySelector(".bottom")
  }
  private writeData(): void {
    this.writeUser()
    this.writeForm()
    this.writeField()
  }
  private writeUser(): void {
    const folder = this.data.type === "user" ? "user" : "group"
    const img = new Image()
    img.onerror = () => (img.src = `/assets/${folder}.jpg`)
    img.alt = this.data.short
    img.src = this.data.image ? `/file/${folder}/${this.data.image}` : `/assets/${folder}.jpg`
    const eimg = <HTMLDivElement>this.el.querySelector(".top .left .user .img")
    eimg.append(img)

    const euname = <HTMLDivElement>this.el.querySelector(".top .left .user .names .uname")
    euname.innerText = this.data.short
    if (this.data.badges) setbadge(euname, this.data.badges)
    const edname = <HTMLDivElement>this.el.querySelector(".top .left .user .names .dname")
    edname.innerText = this.data.long

    const euser = <HTMLDivElement>this.el.querySelector(".top .left .user")
    euser.onclick = () => {
      if (this.data.type === "user") {
        const user = this.users.find((usr) => usr.id === this.data.id)
        swiper(new Profile({ user: user as IUserF, classBefore: this }), userState.content)
      } else {
        swiper(new Group({ group: this.data, users: this.users }), userState.content)
      }
    }
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
    if (s.isFirst) {
      db.c.push({
        m: [],
        r: this.data,
        u: this.users
      })
    }
    const dbchat = db.c.find((k) => k.r.id === this.data.id)
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
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime()
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
