import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import noUser from "../../helper/noUser"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import { MessagesAPI } from "../../properties/MessagesAPI"
import MessageWriter from "../../properties/MessageWriter"
import userState from "../../main/userState"
import db from "../../manager/db"
import swiper from "../../manager/swiper"
import { ChatDB, ChatsDB, UserDB } from "../../types/db.types"
import { RoomDetail } from "../../types/room.types"
import { PrimaryClass } from "../../types/userState.types"
import RoomField from "../parts/RoomField"
import RoomForm from "../parts/RoomForm"
import Profile from "./Profile"
import MessageBuilder from "../../properties/MessageBuilder"

export default class Room implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  public data: RoomDetail
  private chats?: ChatsDB
  private users: UserDB[]
  private middle: HTMLDivElement
  private bottom: HTMLDivElement
  public form: RoomForm
  public field: RoomField
  public list: MessagesAPI
  constructor(s: { data: RoomDetail; users: UserDB[]; chats?: ChatsDB }) {
    this.id = "room"
    this.isLocked = false
    this.users = s.users
    this.chats = s.chats
    this.data = s.data
  }
  private createElement(): void {
    this.el = kelement("div", "Room pmcontent")
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
    img.alt = this.data.name.short
    img.src = this.data.img ? `/file/${this.data.type}/${this.data.img}` : "/assets/user.jpg"
    const eimg = <HTMLDivElement>this.el.querySelector(".top .left .user .img")
    eimg.append(img)

    const euname = <HTMLDivElement>this.el.querySelector(".top .left .user .names .uname")
    euname.innerText = this.data.name.short
    if (this.data.badges) setbadge(euname, this.data.badges)
    const edname = <HTMLDivElement>this.el.querySelector(".top .left .user .names .dname")
    edname.innerText = this.data.name.full

    const euser = <HTMLDivElement>this.el.querySelector(".top .left .user")
    euser.onclick = () => {
      if (this.data.type === "user") {
        const user = this.users.find((usr) => usr.id === this.data.id)
        swiper(new Profile({ user: user as UserDB, classBefore: this }), userState.currcontent)
      }
    }
  }
  private writeForm(): void {
    this.form = new RoomForm({ room: this })
    this.form.run(this.bottom)
  }
  private writeField(): void {
    this.field = new RoomField({ room: this })
    this.list = new MessagesAPI({ data: [] })
    this.field.run(this.middle)

    // const chats = this.data.type === "user" ? db.c : db.g;
    const collection = db.c
    const chats = collection.find((ch) => ch.u.find((usr) => usr.id === this.data.id))
    if (chats) {
      chats.c.forEach((ch) => {
        const user: UserDB = ch.userid === db.me.id ? db.me : chats.u.find((usr) => usr.id === ch.userid) || noUser()
        const message = this.field.send({ ...ch, user, roomid: chats.id })
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
  async sendMessage(messageWriten: MessageWriter, isTemp?: boolean, resend?: MessageBuilder): Promise<void> {
    const message = messageWriten.toJSON()
    const pendingMessage = resend
      ? resend
      : this.field.send(
          {
            ...message,
            id: Date.now().toString(36),
            timestamp: Date.now(),
            userid: db.me.id,
            user: db.me,
            edited: message.edittime,
            source: message.filesrc,
            roomid: this.chats?.id || this.data.id,
            readers: message.watch
          },
          isTemp
        )
    if (resend) this.field.resend(pendingMessage)
    pendingMessage.setStatus("pending")
    await modal.waittime(1000)
    const sentMessage = await xhr.post(`/x/room/sendMessage/${this.data.type}/${this.data.id}`, message)
    if (!sentMessage || !sentMessage.ok) {
      pendingMessage.setStatus("failed")
      if (sentMessage.code === 404 || sentMessage.code === 413) {
        this.isLocked = true
        await modal.alert(lang[sentMessage.msg]?.replace("{SIZE}", "2 MB") || lang.ERROR)
        this.isLocked = false
      }
      pendingMessage.clickListener("retry", "cancel")
      return
    }
    pendingMessage.setStatus("sent")

    const rep = sentMessage.data
    const repChat = (<unknown>rep?.chat) as ChatDB
    pendingMessage.id = repChat.id
    pendingMessage.setTimeStamp(repChat.timestamp)
    const repFirst = rep?.isFirst ? true : false
    const roomid = rep?.roomid as string
    if (repFirst) {
      db.c.push({
        c: [repChat],
        id: roomid,
        u: this.users
      })
    }
    const dbchat = db.c.find((k) => k.id === roomid)
    if (dbchat) dbchat.c.push(repChat)
    if (userState.center?.id === "chats") {
      userState.center?.update({
        chat: repChat,
        users: this.users,
        roomid: roomid,
        isFirst: repFirst,
        roomdata: this.data
      })
    }
  }
  async deleteMessage(msgid: string): Promise<void> {
    console.log(msgid)
    return
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
    culement.app().append(this.el)
    this.writeData()
  }
}
