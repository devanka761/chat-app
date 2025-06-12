import { escapeHTML, ss } from "../helper/escaper"
import kelement from "../helper/kelement"
import { lang } from "../helper/lang"
import modal from "../helper/modal"
import sdate from "../helper/sdate"
import setbadge from "../helper/setbadge"
import { transpileChat } from "../main/transpileChat"
import db from "../manager/db"
import Room from "../pm/content/Room"
import { UserDB } from "../types/db.types"
import { IMessageBuilder, MessageOptionType } from "../types/message.types"
import { TStatusIcon, TStatusText } from "../types/room.types"
import MessageWriter from "./MessageWriter"
import OptionMsgBuilder from "./OptionMsgBuilder"

const statusIcon: TStatusIcon = {
  pending: '<i class="fa-duotone fa-regular fa-clock"></i>',
  sent: '<i class="fa-regular fa-check"></i>',
  read: '<i class="fa-regular fa-check-double"></i>',
  failed: '<i class="fa-regular fa-rotate-left"></i>'
}
const msgoptIndex: { [key in MessageOptionType]: number } = {
  profile: 1,
  reply: 2,
  edit: 3,
  retry: 4,
  delete: 5,
  cancel: 6
}
export default class MessageBuilder {
  private el: HTMLDivElement
  private field: HTMLDivElement
  private user: UserDB
  private s: IMessageBuilder
  private sender: HTMLDivElement
  private timestamp: HTMLDivElement
  private reply?: HTMLDivElement
  private attach?: HTMLDivElement
  private textMessage: HTMLParagraphElement
  private textEdidted: HTMLSpanElement
  private sendStatus: HTMLDivElement
  private optmenu: HTMLDivElement
  public room: Room
  private optLocked: boolean
  constructor(s: IMessageBuilder, room: Room) {
    this.s = s
    this.user = s.user
    this.room = room
    this.optLocked = false
  }
  private createElement(): void {
    this.el = kelement("div", "card")
    this.field = kelement("div", "field")
    if (this.user.id === db.me.id) {
      this.el.classList.add("me")
    }
    this.el.append(this.field)
  }
  private renderUser(): void {
    this.sender = kelement("div", "chp sender", {
      e: ss(escapeHTML(this.user.username))
    })
    if (this.user.badges) setbadge(this.sender, this.user.badges)
    this.field.append(this.sender)
  }
  private renderReply(): void {
    if (!this.s.reply) return
    const msgAPI = this.room.list.get(this.s.reply)
    if (!msgAPI) return
    const target = msgAPI.json
    const { user } = target
    const replysender = kelement("div", "name", { e: ss(escapeHTML(user.username)) })
    const replymsg = kelement("div", "msg", { e: transpileChat(target, null, true) })
    this.reply = kelement("div", "chp embed", { e: [replysender, replymsg] })
    this.reply.onclick = () => {
      const msgHTML = msgAPI.html
      msgHTML.scrollIntoView()
      msgAPI.highlight()
    }
    this.field.append(this.reply)
  }
  private attachImage(eattach: HTMLDivElement, url: string, roomid: string, isTemp: boolean): void {
    const parent = kelement("div", "img")
    const img = new Image()
    img.onerror = () => {
      img.remove()
      parent.remove()
      this.attachFile(eattach, url, roomid, isTemp)
    }
    img.src = isTemp ? url : `/file/media/${roomid}/${url}`
    img.alt = isTemp ? Date.now().toString(32) : url
    parent.append(img)
    eattach.append(parent)
  }
  private attachVideo(eattach: HTMLDivElement, url: string, roomid: string, isTemp: boolean): void {
    const parent = kelement("div", "img")
    const vid = kelement("video")
    vid.onerror = () => {
      vid.remove()
      parent.remove()
      this.attachFile(eattach, url, roomid, isTemp)
    }
    vid.controls = true
    vid.src = isTemp ? url : `/file/media/${roomid}/${url}`
    parent.prepend(vid)
    eattach.append(parent)
  }
  private attachFile(eattach: HTMLDivElement, url: string, roomid: string, isTemp: boolean): void {
    const efile = kelement("a", "document", {
      a: { href: isTemp ? url : `/file/media/${roomid}/${url}`, target: "_blank" },
      e: isTemp ? Date.now().toString(32) : url
    })
    eattach.append(efile)
  }
  private renderAttach(isTemp: boolean): void {
    if (this.s.type !== "image" && this.s.type !== "video" && this.s.type !== "file" && this.s.type !== "audio") return
    if (!this.s.source) return
    this.attach = kelement("div", "chp attach")
    if (this.s.type === "image") {
      this.attachImage(this.attach, this.s.source, this.s.roomid, isTemp)
    } else if (this.s.type === "video") {
      this.attachVideo(this.attach, this.s.source, this.s.roomid, isTemp)
    } else {
      this.attachFile(this.attach, this.s.source, this.s.roomid, isTemp)
    }
    this.field.append(this.attach)
  }
  private renderCall(): void {
    // <div class="chp vc"><div class="vc-icon"></div><div class="vc-message"><p>Voice Call</p></div></div>
  }
  private renderText(): void {
    this.textMessage = kelement("p")
    this.textEdidted = kelement("span", "edited")
    const textParent = kelement("div", "chp text", { e: [this.textMessage, this.textEdidted] })
    this.field.append(textParent)
    if (this.s.text) this.textMessage.innerHTML = escapeHTML(this.s.text)
  }
  private renderTime(): void {
    this.timestamp = kelement("div", "ts", { e: sdate.parseTime(this.s.timestamp) })
    this.sendStatus = kelement("div", "status")
    const timeParent = kelement("div", "chp time", { e: [this.timestamp, this.sendStatus] })
    this.field.append(timeParent)
  }
  set edit(text: string) {
    this.s.text = text
    this.s.edited = Date.now()
    this.textMessage.innerHTML = escapeHTML(text)
    this.textEdidted.innerText = lang.CONTENT_EDITED
  }
  private init(isTemp: boolean): void {
    this.createElement()
    if (this.user.id !== db.me.id) this.renderUser()
    this.renderReply()
    this.renderAttach(isTemp)
    this.renderCall()
    this.renderText()
    this.renderTime()
    this.clickListener()
  }
  private renderOptmenu(...args: MessageOptionType[]): void {
    if (this.optLocked) return
    this.optLocked = true
    setTimeout(() => {
      this.optLocked = false
    }, 450)
    this.optmenu = kelement("div", "optmenu")
    const optConfig = { msg: this, room: this.room }
    if (args && args.length >= 1) {
      args = args.sort((a, b) => {
        if (msgoptIndex[a] > msgoptIndex[b]) return 1
        if (msgoptIndex[a] < msgoptIndex[b]) return -1
        return 0
      })
      args.forEach((k) => {
        const btnMenu = new OptionMsgBuilder({ ...optConfig, optype: k })
        this.optmenu.append(btnMenu.run())
      })
      this.el.prepend(this.optmenu)
      this.el.scrollIntoView()
      return
    }
    if (this.user.id !== db.me.id) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "profile" }).run())
    }
    if (this.s.type === "deleted") {
      this.el.prepend(this.optmenu)
      return
    }
    this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "reply" }).run())
    if (this.s.type !== "voice" && this.s.type !== "call" && this.user.id === db.me.id) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "edit" }).run())
    }

    if (this.user.id === db.me.id) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "delete" }).run())
    }

    this.el.prepend(this.optmenu)
    this.el.scrollIntoView()
  }
  async closeOptmenu(): Promise<void> {
    if (this.optLocked) return
    this.optLocked = true
    if (this.optmenu && this.el.contains(this.optmenu)) {
      this.optmenu.classList.add("out")
      await modal.waittime(500)
      this.el.removeChild(this.optmenu)
    }
    this.optLocked = false
  }
  clickListener(...args: MessageOptionType[]): void {
    this.el.onclick = (e) => {
      const { target } = e
      if (target instanceof Node) {
        if (this.optmenu?.contains(target)) return
        if (this.s.type === "video" && this.attach?.contains(target)) return
        if (this.reply?.contains(target)) {
          this.closeOptmenu()
          return
        }
      }
      if (this.optmenu && this.el.contains(this.optmenu)) {
        this.closeOptmenu()
        return
      }
      this.room.list.entries.forEach((msg) => {
        msg.closeOptmenu()
      })
      this.renderOptmenu(...args)
    }
  }
  getUser(): UserDB {
    return this.user
  }
  get id(): string {
    return this.s.id
  }
  set id(message_id: string) {
    this.s.id = message_id
  }
  setStatus(statusText: TStatusText): void {
    if (statusText === "failed") {
      this.sendStatus.innerHTML = `${statusIcon[statusText]}`
      this.sendStatus.classList.add("btn")
      this.el.classList.add("error")
      this.timestamp.innerHTML = lang.FAILED
    } else {
      this.setTimeStamp(Date.now())
      this.sendStatus.innerHTML = statusIcon[statusText]
      this.sendStatus.classList.remove("btn")
      this.el.classList.remove("error")
    }
  }
  setTimeStamp(ts: number): void {
    this.timestamp.innerHTML = sdate.parseTime(ts)
  }
  get html(): HTMLDivElement {
    return this.el
  }
  get json(): IMessageBuilder {
    return this.s
  }
  get raw(): MessageWriter {
    const messages = new MessageWriter(this.s)
    return messages
  }
  async highlight(): Promise<void> {
    if (this.el.classList.contains("highlight")) return
    this.el.classList.add("highlight")
    await modal.waittime(5000, 5)
    this.el.classList.remove("highlight")
  }
  run(isTemp?: boolean): this {
    this.init(isTemp || false)
    return this
  }
}
