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

function getOptOffsetToList(child: HTMLDivElement, parent: HTMLDivElement) {
  let offset = 0
  while (child && child !== parent) {
    offset += child.offsetTop
    if (child.offsetParent) child = child.offsetParent as HTMLDivElement
  }
  return offset
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
  private isRetry: boolean
  constructor(s: IMessageBuilder, room: Room) {
    this.s = s
    this.user = s.user
    this.room = room
    this.optLocked = false
    this.isRetry = false
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
    if (this.s.type === "deleted") return
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
    if (this.s.type === "deleted") return
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
    if (this.s.type === "deleted") {
      textParent.classList.add("del")
      this.textMessage.innerHTML = `<i class="fa-solid fa-ban"></i> ${this.user.id === db.me.id ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}`
      return
    }
    if (this.s.edited) this.textEdidted.innerHTML = `(${lang.CONTENT_EDITED})`
    if (this.s.text) this.textMessage.innerHTML = escapeHTML(this.s.text)
  }
  private renderTime(): void {
    this.timestamp = kelement("div", "ts", { e: sdate.parseTime(this.s.timestamp) })
    this.sendStatus = kelement("div", "status")
    const timeParent = kelement("div", "chp time", { e: [this.timestamp, this.sendStatus] })
    this.field.append(timeParent)
  }
  set deleted(isDeleted: boolean) {
    if (isDeleted) {
      this.s.type = "deleted"
      this.timestamp.parentElement?.remove()
      this.attach?.remove()
      this.reply?.remove()
      this.textMessage.parentElement?.classList.add("del")
      this.textMessage.innerHTML = `<i class="fa-solid fa-ban"></i> ${this.user.id === db.me.id ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}`
    }
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
    if (this.s.type === "deleted") this.deleted = true
    this.clickListener()
  }
  private fixElHeight(eoptmenu: HTMLDivElement): void {
    eoptmenu.style.top = `-${eoptmenu.clientHeight}px`
    const listViewTop = this.room.field.html.scrollTop
    const listViewBottom = listViewTop + this.room.field.html.clientHeight

    const cardTop = getOptOffsetToList(eoptmenu, this.room.field.html) - eoptmenu.clientHeight
    const cardBottom = cardTop + eoptmenu.scrollHeight

    const isVisible = cardBottom > listViewTop && cardTop < listViewBottom
    if (cardBottom < 1) {
      this.room.field.html.style.paddingTop = `${-1 * cardBottom + 20}px`
    }
    if (!isVisible) this.room.field.html.scrollTop = cardBottom - 10
  }
  private renderOptmenu(...args: MessageOptionType[]): void {
    if (this.room.opt) {
      if (this.room.opt === this.optmenu) {
        console.log("canceled:", "message option closed")
        return
      }
      if (this.room.optRetrying) {
        console.log("canceled:", "message option closed")
        return
      }
      console.log("retry:", "opening message option ...")
      this.isRetry = true
      this.room.optRetrying = this.optmenu
      setTimeout(() => this.renderOptmenu(...args), 200)
      return
    }
    if (this.isRetry) {
      console.log("success:", "message option opened")
    }
    if (!this.isRetry && this.room.optRetrying) return
    if (this.optLocked) return
    this.optmenu = kelement("div", "optmenu")
    this.room.opt = this.optmenu
    delete this.room.optRetrying
    if (this.isRetry) {
      window.addEventListener("click", () => this.closeOptmenu(), { once: true })
      this.isRetry = false
    } else {
      window.addEventListener(
        "click",
        () => {
          window.addEventListener("click", () => this.closeOptmenu(), { once: true })
        },
        { once: true }
      )
    }
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
      this.fixElHeight(this.optmenu)
      return
    }
    if (this.user.id !== db.me.id) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "profile" }).run())
    }
    if (this.s.type === "deleted") {
      if (this.user.id === db.me.id) {
        this.optmenu.remove()
        return
      }
      this.el.prepend(this.optmenu)
      this.fixElHeight(this.optmenu)
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
    this.fixElHeight(this.optmenu)
  }
  async closeOptmenu(): Promise<void> {
    // if (this.optLocked) return
    this.optLocked = true
    if (this.optmenu && this.el.contains(this.optmenu)) {
      this.optmenu.classList.add("out")
      await modal.waittime(200)
      this.el.removeChild(this.optmenu)
      this.el.removeAttribute("style")
      this.room.field.html.removeAttribute("style")
    }
    this.optLocked = false
    delete this.room.opt
  }
  clickListener(...args: MessageOptionType[]): void {
    this.el.onclick = (e) => {
      const { target } = e
      if (target instanceof Node) {
        if (this.optmenu?.contains(target)) return
        if (this.s.type === "video" && this.attach?.contains(target)) return
        if (this.reply?.contains(target)) return
      }
      if (this.optmenu && this.el.contains(this.optmenu)) return
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
      this.setTimeStamp(this.s.timestamp || Date.now())
      this.sendStatus.innerHTML = statusIcon[statusText]
      this.sendStatus.classList.remove("btn")
      this.el.classList.remove("error")
    }
  }
  setTimeStamp(ts: number): void {
    this.timestamp.innerHTML = sdate.parseTime(ts)
  }
  setText(txt: string): void {
    this.s.text = txt
    this.textMessage.innerHTML = escapeHTML(txt)
  }
  setEdited(ts?: number): void {
    this.s.edited = ts
    if (ts) this.textEdidted.innerHTML = `(${lang.CONTENT_EDITED})`
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
