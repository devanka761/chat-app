import { eroot, kel } from "../../helper/kel"
import modal from "../../helper/modal"
import noUser from "../../helper/noUser"
import setbadge from "../../helper/setbadge"
import userState from "../../main/userState"
import db from "../../manager/db"
import swiper from "../../manager/swiper"
import { IChatsF, IMessageF, IRoomDataF, IUserF } from "../../types/db.types"
import {} from "../../types/room.types"
import { PrimaryClass } from "../../types/userState.types"
import RoomField from "../parts/RoomField"
import RoomForm from "../parts/RoomForm"
import Profile from "./Profile"
import { IWritterF } from "../../types/message.types"
import MessageBuilder from "../../properties/MessageBuilder"
import { convertMessage } from "../../helper/helper"
import xhr from "../../helper/xhr"
import { IRepB } from "../../../backend/types/validate.types"
import { lang } from "../../helper/lang"

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
  public field: RoomField
  public opt?: HTMLDivElement
  public optRetrying?: HTMLDivElement
  constructor(s: { data: IRoomDataF; users: IUserF[]; chats?: IChatsF }) {
    this.role = "room"
    this.isLocked = false
    this.users = s.users
    this.chats = s.chats
    this.data = s.data
    this.id = s.data.id
    this.field = new RoomField({ room: this })
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
    const img = new Image()
    img.onerror = () => (img.src = `/assets/${this.data.type}.jpg`)
    img.alt = this.data.short
    img.src = this.data.image ? `/file/${this.data.type}/${this.data.image}` : "/assets/user.jpg"
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
        swiper(new Profile({ user: user as IUserF, classBefore: this }), userState.currcontent)
      }
    }
  }
  private writeForm(): void {
    this.form = new RoomForm({ room: this })
    this.form.run(this.bottom)
  }
  private writeField(): void {
    this.field.run(this.middle)

    const collection = db.c
    const chats = collection.find((ch) => ch.r.id === this.data.id)
    if (chats) {
      chats.m.forEach((ch) => {
        const user: IUserF = ch.userid === db.me.id ? db.me : chats.u.find((usr) => usr.id === ch.userid) || noUser()
        const message = new MessageBuilder(ch, user, this)
        this.field.send(message.run())
        if (this.data.type === "user" && ch.readers?.includes(this.data.id)) {
          message.setStatus("read")
        } else {
          message.setStatus("sent")
        }
      })
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
  }
  async createNewMessage(s: IWritterF): Promise<void> {
    const msg = { ...convertMessage(db.me.id, s), id: Date.now().toString(36) }
    const message: MessageBuilder = new MessageBuilder(msg, db.me, this, s)
    this.field.send(message.run(true))
    this.sendNewMessage(s, message)
  }
  async sendEditedMessage(_s: IWritterF): Promise<void> {
    return
  }
  async sendWritter(s: IWritterF): Promise<void> {
    if (s.edit) return await this.sendEditedMessage(s)
    return await this.createNewMessage(s)
  }
  async deleteMessage(_msgid: string): Promise<void> {
    return
  }
  // async sendMessage(messageWriten: MessageWriter, isTemp?: boolean, resend?: MessageBuilder, rollback?: IMessageBuilder): Promise<void> {
  //   const message = messageWriten.toJSON()
  //   const pendingMessage = resend
  //     ? resend
  //     : this.field.send(
  //         {
  //           ...message,
  //           id: Date.now().toString(36),
  //           timestamp: Date.now(),
  //           userid: db.me.id,
  //           user: db.me,
  //           edited: message.edittime,
  //           source: message.filesrc,
  //           roomid: this.chats?.id || this.data.id,
  //           readers: message.watch
  //         },
  //         isTemp
  //       )
  //   if (resend && !rollback) this.field.resend(pendingMessage)
  //   pendingMessage.setStatus("pending")
  //   await modal.waittime(1000)
  //   const sentMessage = await xhr.post(`/x/room/sendMessage/${this.data.type}/${this.data.id}`, message)
  //   if (!sentMessage || !sentMessage.ok) {
  //     this.isLocked = true
  //     if (rollback) {
  //       pendingMessage.setTimeStamp(rollback.timestamp)
  //       await modal.alert(lang[sentMessage.msg] || lang.ERROR)
  //       pendingMessage.setStatus(this.data.type === "user" && rollback.readers?.includes(this.data.id) ? "read" : "sent")
  //       pendingMessage.setText(rollback.text as string)
  //       pendingMessage.setEdited(rollback.edited)
  //       this.isLocked = false
  //       return
  //     }
  //     pendingMessage.setStatus("failed")
  //     if (sentMessage.code === 404 || sentMessage.code === 413) {
  //       await modal.alert(lang[sentMessage.msg]?.replace("{SIZE}", "2 MB") || lang.ERROR)
  //       this.isLocked = false
  //     }
  //     pendingMessage.clickListener("retry", "cancel")
  //     this.isLocked = false
  //     return
  //   }
  //   pendingMessage.setStatus("sent")

  //   const repChat: IMessageF = sentMessage.data.chat
  //   pendingMessage.id = repChat.id
  //   pendingMessage.setTimeStamp(repChat.timestamp)
  //   const repFirst = sentMessage.data.isFirst ? true : false
  //   const roomdata: IRoomDataF = sentMessage.data.roomdata
  //   if (repFirst) {
  //     db.c.push({
  //       m: [],
  //       r: roomdata,
  //       u: this.users
  //     })
  //   }
  //   const dbchat = db.c.find((k) => k.r.id === roomdata.id)
  //   if (dbchat) {
  //     const oldDB = dbchat.m.find((ch) => ch.id === repChat.id)
  //     if (oldDB) {
  //       oldDB.text = repChat.text
  //       oldDB.edited = repChat.edited
  //       pendingMessage.setEdited(repChat.edited)
  //     } else {
  //       dbchat.m.push(repChat)
  //     }
  //   }
  //   if (userState.center?.id === "chats") {
  //     if (dbchat && dbchat.m[dbchat.m.length - 1].id !== repChat.id) return
  //     userState.center?.update({
  //       chat: repChat,
  //       users: this.users,
  //       roomid: roomdata.id,
  //       isFirst: repFirst,
  //       roomdata: roomdata
  //     })
  //   }
  // }
  // async deleteMessage(msgid: string): Promise<void> {
  //   const message = this.list.get(msgid)
  //   if (!message) return
  //   const isUser = this.data.type === "user"
  //   message.setStatus("pending")

  //   const deletedMessage = await xhr.post(`/x/room/delMessage/${this.data.type}/${this.data.id}/${msgid}`)
  //   if (!deletedMessage || !deletedMessage.ok) {
  //     this.isLocked = true
  //     await modal.alert(lang[deletedMessage.msg] || lang.ERROR)
  //     message.setStatus(isUser && message.json.readers?.includes(this.data.id) ? "read" : "sent")
  //     this.isLocked = false
  //     return
  //   }
  //   message.deleted = true

  //   const roomdata: IRoomDataF = deletedMessage.data.roomdata
  //   const roomid = roomdata.id
  //   const dbchat = db.c.find((k) => k.r.id === roomid)
  //   if (userState.center?.id === "chats") {
  //     if (dbchat?.m[dbchat.m.length - 1].id === msgid) {
  //       userState.center?.update({
  //         chat: message.json,
  //         users: this.users,
  //         roomid: roomid,
  //         isFirst: false,
  //         roomdata: roomdata
  //       })
  //     }
  //   }
  //   return
  // }
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
