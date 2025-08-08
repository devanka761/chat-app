import { marked } from "marked"
import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import { copyToClipboard } from "../../../helper/navigator"
import notip from "../../../helper/notip"
import sdate from "../../../helper/sdate"
import setbadge from "../../../helper/setbadge"
import { transpileChat } from "../../../main/transpileChat"
import db from "../../../manager/db"
import Room from "../../../pm/content/Room"
import { IMessageF, IUserF } from "../../../types/db.types"
import { IWritterF, MessageOptionType } from "../../../types/message.types"
import { TStatusIcon, TStatusText } from "../../../types/room.types"
import OptionMsgBuilder from "./OptionMsgBuilder"
import AudioBuilder from "./AudioBuilder"
import { escapeHTML, escapeWhiteSpace, renderer } from "../../../helper/escaper"
import CallMsgBuilder from "./CallMsgBuilder"
import { KirAIRoom } from "../../../helper/AccountKirAI"

const statusIcon: TStatusIcon = {
  pending: '<i class="fa-duotone fa-solid fa-spinner-third fa-spin"></i>',
  sent: '<i class="fa-regular fa-check"></i>',
  read: '<i class="fa-regular fa-check-double"></i>',
  failed: '<i class="fa-regular fa-rotate-left"></i>'
}
const msgoptIndex: { [key in MessageOptionType]: number } = {
  profile: 1,
  copy: 2,
  download: 3,
  reply: 4,
  edit: 5,
  retry: 6,
  delete: 7,
  cancel: 8
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
  private avatar: HTMLDivElement
  private img: HTMLImageElement
  private user: IUserF
  private s: IMessageF
  private sender: HTMLDivElement
  private timestamp: HTMLDivElement
  private reply?: HTMLDivElement
  private attach?: HTMLDivElement
  private textMessage: HTMLDivElement
  private textEdidted: HTMLSpanElement
  private sendStatus?: HTMLDivElement | null
  private optmenu: HTMLDivElement
  public room: Room
  private optLocked: boolean
  private isRetry: boolean
  public raw?: IWritterF
  private lastStatus?: TStatusText
  call?: CallMsgBuilder
  private index: number
  private isNewUser: boolean
  constructor(message: IMessageF, user: IUserF, room: Room, raw?: IWritterF, istemp?: boolean) {
    this.s = message
    this.user = user
    this.room = room
    this.optLocked = false
    this.isRetry = false
    this.index = room.field.list.entries.length
    if (raw) this.raw = raw
    this.run(istemp || false)
  }
  private createElement(): void {
    const messageBefore = this.room.field.list.getByIndex(this.index - 1)
    const userBefore = messageBefore?.user

    this.isNewUser = !userBefore || userBefore.id !== this.user.id

    this.el = kel("div", "card")
    if (!this.isNewUser) this.el.classList.add("follow")
    this.field = kel("div", "field")
    if (this.user.id === db.me.id) {
      this.el.classList.add("me")
    }
    this.el.append(this.field)
    if (this.room.data.type === "group") {
      this.avatar = kel("div", "avatar")
      this.el.prepend(this.avatar)
    }
  }
  private renderUser(): void {
    if (this.isNewUser) {
      this.sender = kel("div", "chp sender")
      this.sender.innerText = this.user.username
      if (this.user.badges) setbadge(this.sender, this.user.badges)
      this.field.append(this.sender)
    }
    if (this.avatar && this.isNewUser) {
      this.img = new Image()
      this.img.onerror = () => (this.img.src = "/assets/user.jpg")
      this.img.alt = this.user.username
      this.img.src = this.user.image ? `/file/user/${this.user.image}` : `/assets/user.jpg`
      this.avatar.append(this.img)
    }
  }
  private renderReply(): void {
    if (this.s.type === "deleted") return
    if (!this.s.reply) return
    const msgAPI = this.room.field.list.get(this.s.reply)
    if (!msgAPI) return
    const { user, message } = msgAPI.json
    const replysender = kel("div", "name")
    replysender.innerText = user.username
    const replymsg = kel("div", "msg", { e: transpileChat(message, null, true) })
    this.reply = kel("div", "chp embed", { e: [replysender, replymsg] })
    this.reply.onclick = () => {
      const msgHTML = msgAPI.html
      msgHTML.scrollIntoView({ behavior: "smooth" })
      msgAPI.highlight()
    }
    this.field.append(this.reply)
  }
  private attachImage(eattach: HTMLDivElement, url: string, isTemp: boolean): void {
    const parent = kel("div", "img")
    const img = new Image()
    img.onerror = () => {
      img.remove()
      parent.remove()
      this.attachFile(eattach, url, isTemp)
    }
    img.onload = () => this.room.checkIfMediaReady()
    img.src = isTemp ? url : `/file/media/${this.room.data.type}/${this.room.id}/${url}`
    img.alt = isTemp ? Date.now().toString(32) : url
    parent.append(img)
    eattach.append(parent)
  }
  private attachVideo(eattach: HTMLDivElement, url: string, isTemp: boolean): void {
    let firstReady = false
    const parent = kel("div", "img")
    const vid = kel("video")
    vid.onerror = () => {
      vid.remove()
      parent.remove()
      this.attachFile(eattach, url, isTemp)
    }
    vid.oncanplay = () => {
      if (!firstReady) {
        firstReady = true
        this.room.checkIfMediaReady()
      }
    }
    vid.controls = true
    vid.setAttribute("controlsList", "nodownload")
    vid.src = isTemp ? url : `/file/media/${this.room.data.type}/${this.room.id}/${url}`
    parent.prepend(vid)
    eattach.append(parent)
  }
  private attachAudio(eattach: HTMLDivElement, url: string, isTemp: boolean): void {
    let firstReady = false
    if (this.s.type !== "audio" && this.s.type !== "voice") {
      return this.attachFile(eattach, url, isTemp)
    }
    const audio = new Audio()
    const voice = new AudioBuilder({ msg: this, audio }).setType(this.s.type).run()
    audio.onerror = () => {
      audio.remove()
      voice.remove()
      this.attachFile(eattach, url, isTemp)
    }
    audio.onended = () => {
      voice.stop()
    }
    audio.ontimeupdate = () => {
      voice.time = audio.currentTime
    }
    audio.oncanplay = () => {
      if (!eattach.contains(voice.html)) eattach.prepend(voice.html)
      if (!firstReady) {
        firstReady = true
        this.room.checkIfMediaReady()
      }
    }
    audio.onloadedmetadata = () => {
      voice.text = audio.duration
    }
    audio.src = isTemp ? url : `/file/media/${this.room.data.type}/${this.room.id}/${url}`
    eattach.append(audio)
  }
  private attachFile(eattach: HTMLDivElement, url: string, isTemp: boolean): void {
    const efile = kel("span", "document", {
      a: { href: isTemp ? url : `/file/media/${this.room.data.type}/${this.room.id}/${url}` },
      e: isTemp ? Date.now().toString(32) : url
    })
    eattach.append(efile)
    this.room.checkIfMediaReady()
  }
  private renderAttach(isTemp: boolean): void {
    const validMedia = ["voice", "video", "image", "file", "audio"]
    if (!validMedia.find((ity) => ity === this.s.type)) return
    if (!this.s.source) return
    this.attach = kel("div", "chp attach")
    if (this.s.type === "image") {
      this.attachImage(this.attach, this.s.source, isTemp)
    } else if (this.s.type === "video") {
      this.attachVideo(this.attach, this.s.source, isTemp)
    } else if (this.s.type === "voice" || this.s.type === "audio") {
      this.attachAudio(this.attach, this.s.source, isTemp)
    } else {
      this.attachFile(this.attach, this.s.source, isTemp)
    }
    this.field.append(this.attach)
  }
  private renderCall(): void {
    if (this.s.type !== "call") return
    if (this.s.duration === undefined || this.s.duration === null) return
    this.call = new CallMsgBuilder({ user: this.user, duration: this.s.duration })
    this.field.append(this.call.html)
  }
  private renderText(): void {
    this.textMessage = kel("div", "msg")
    this.textEdidted = kel("span", "edited")
    const textParent = kel("div", "chp text", { e: [this.textMessage, this.textEdidted] })
    this.field.append(textParent)
    if (this.s.type === "deleted") {
      textParent.classList.add("del")
      this.textMessage.innerHTML = `<i class="fa-solid fa-ban"></i> ${this.user.id === db.me.id ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}`
      return
    }
    if (this.s.edited) this.textEdidted.innerHTML = `(${lang.CONTENT_EDITED})`
    if (this.s.text) {
      if (this.user.id === KirAIRoom.id) {
        this.textMessage.innerHTML = marked.use({ renderer, gfm: true, breaks: true }).parse(escapeHTML(this.s.text)).toString()
      } else {
        this.textMessage.innerText = escapeWhiteSpace(this.s.text)
      }
    }
  }
  private renderTime(): void {
    const timeParent = kel("div", "chp time")
    this.timestamp = kel("div", "ts", { e: sdate.parseTime(this.s.timestamp) })
    timeParent.append(this.timestamp)
    if (this.user.id === db.me.id && this.s.type !== "call") {
      this.sendStatus = kel("div", "status")
      timeParent.append(this.sendStatus)
    }
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
      this.textEdidted.remove()
    }
  }
  set edit(text: string) {
    this.s.text = text
    this.s.edited = Date.now()
    this.textMessage.innerText = escapeWhiteSpace(this.s.text)
    this.textEdidted.innerText = lang.CONTENT_EDITED
  }
  private init(isTemp: boolean): void {
    this.createElement()
    if (this.room.data.type === "group" && this.user.id !== db.me.id) this.renderUser()
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
      if (this.room.opt === this.optmenu) return
      if (this.room.optRetrying) return
      this.isRetry = true
      this.room.optRetrying = this.optmenu
      setTimeout(() => this.renderOptmenu(...args), 200)
      return
    }
    if (!this.isRetry && this.room.optRetrying) return
    if (this.optLocked) return
    this.optmenu = kel("div", "optmenu")
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
    if (this.user.id !== db.me.id && this.user.id !== "-1") {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "profile" }).run())
    }
    if (["image", "video", "audio", "file"].find((ity) => ity === this.s.type)) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "download" }).run())
    }
    if (this.s.text && this.s.text.length >= 1 && this.s.type !== "deleted") {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "copy" }).run())
    }
    if (this.s.type === "deleted" || this.s.type === "call") {
      if (this.user.id === db.me.id || this.user.id === "-1") {
        this.closeOptmenu()
        return
      }
      this.el.prepend(this.optmenu)
      this.fixElHeight(this.optmenu)
      return
    }
    this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "reply" }).run())
    if (this.s.type !== "voice" && this.user.id === db.me.id) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "edit" }).run())
    }

    if (this.user.id === db.me.id || (db.me.badges?.includes(1) && this.room.data.id === "696969")) {
      this.optmenu.append(new OptionMsgBuilder({ ...optConfig, optype: "delete" }).run())
    }

    this.el.prepend(this.optmenu)
    this.fixElHeight(this.optmenu)
  }
  async closeOptmenu(): Promise<void> {
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
      if (this.room.data.id === KirAIRoom.id) return
      const { target } = e
      if (target instanceof Node) {
        if (this.optmenu?.contains(target)) return
        if ((this.s.type === "video" || this.s.type === "voice" || this.s.type === "audio") && this.attach?.contains(target)) return
        if (this.reply?.contains(target)) return
        if (this.lastStatus === "pending") return
      }
      if (this.optmenu && this.el.contains(this.optmenu)) return
      this.renderOptmenu(...args)
    }
  }
  getUser(): IUserF {
    return this.user
  }
  get id(): string {
    return this.s.id
  }
  set id(message_id: string) {
    this.s.id = message_id
  }
  get currentStatus(): TStatusText | undefined {
    return this.lastStatus
  }
  setStatus(statusText: TStatusText): void {
    if (!this.sendStatus) return
    this.lastStatus = statusText
    if (statusText === "failed") {
      this.clickListener("retry", "cancel")
      this.sendStatus.innerHTML = this.room.data.id === KirAIRoom.id ? "" : `${statusIcon[statusText]}`
      this.sendStatus.classList.add("btn")
      this.el.classList.add("error")
      this.timestamp.innerHTML = lang.FAILED
    } else {
      if (statusText === "pending") this.timestamp.innerHTML = lang.CONTENT_SENDING
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
    if (this.user.id === KirAIRoom.id) {
      this.textMessage.innerHTML = marked.use({ renderer, gfm: true, breaks: true }).parse(escapeHTML(this.s.text)).toString()
    } else {
      this.textMessage.innerText = escapeWhiteSpace(this.s.text)
    }
  }
  setEdited(ts?: number): void {
    this.s.edited = ts
    if (ts) this.textEdidted.innerHTML = `(${lang.CONTENT_EDITED})`
  }
  get html(): HTMLDivElement {
    return this.el
  }
  get json() {
    return { message: this.s, user: this.user }
  }
  async highlight(): Promise<void> {
    if (this.el.classList.contains("highlight")) return
    this.el.classList.add("highlight")
    await modal.waittime(5000, 5)
    this.el.classList.remove("highlight")
  }
  async copyText(): Promise<boolean> {
    if (!this.s.text || this.s.text.length < 1) return false
    // textHighlight(this.textMessage)
    const isCopied = await copyToClipboard(this.s.text)
    if (isCopied) notip({ a: `${lang.NP_COPIED}:`, b: this.s.text, ic: "clipboard-check", c: "1" })
    return isCopied
  }
  async saveAs(): Promise<void> {
    if (!this.s.source) return
    const isSent = !this.lastStatus || this.lastStatus === "sent" || this.lastStatus === "read"
    const a = kel("a")
    a.href = isSent ? `/file/media/${this.room.data.type}/${this.room.id}/${this.s.source}` : this.s.source
    a.download = isSent ? this.s.source : Date.now().toString(36)
    document.body.append(a)
    a.click()

    await modal.waittime(2000)
    document.body.removeChild(a)
    a.remove()
  }
  update(s: IMessageF): this {
    this.s = s
    if (!this.attach) return this
    if (!this.s.source) return this
    if (this.s.type !== "file") return this
    while (this.attach.lastChild) this.attach.lastChild.remove()
    this.attachFile(this.attach, this.s.source, false)
    return this
  }
  private run(isTemp?: boolean): this {
    this.init(isTemp || false)
    return this
  }
}
