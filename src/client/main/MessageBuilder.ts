import { escapeHTML, ss } from "../helper/escaper"
import kelement from "../helper/kelement"
import { lang } from "../helper/lang"
import sdate from "../helper/sdate"
import setbadge from "../helper/setbadge"
import db from "../manager/db"
import { UserDB } from "../types/db.types"
import { IMessageBuilder, IMessageEmbed } from "../types/message.types"
import { TStatusIcon, TStatusText } from "../types/room.types"

const mediaIcons: { [key: string]: string } = {
  file: '<i class="fa-light fa-file"></i>',
  image: '<i class="fa-light fa-image"></i>',
  video: '<i class="fa-light fa-film"></i>',
  audio: '<i class="fa-light fa-music"></i>'
}
const statusIcon: TStatusIcon = {
  pending: '<i class="fa-duotone fa-regular fa-clock"></i>',
  sent: '<i class="fa-regular fa-check"></i>',
  read: '<i class="fa-regular fa-check-double"></i>',
  failed: '<i class="fa-duotone fa-regular fa-triangle-exclamation"></i>'
}
export default class MessageBuilder {
  private el: HTMLDivElement
  private user: UserDB
  private s: IMessageBuilder
  private sender: HTMLDivElement
  private timestamp: HTMLDivElement
  private reply?: HTMLDivElement
  private attach?: HTMLDivElement
  private textMessage: HTMLParagraphElement
  private textEdidted: HTMLSpanElement
  private sendStatus: HTMLDivElement
  // constructor({ data, user }: { data: IMessageBuilder; user: UserDB }) {
  constructor(s: IMessageBuilder) {
    this.s = s
    this.user = s.user
    // this.user = user
    // this.s = { ...data }
  }
  private createElement(): void {
    this.el = kelement("div", "card")
    if (this.user.id === db.me.id) {
      this.el.classList.add("me")
    }
  }
  private renderUser(): void {
    this.sender = kelement("div", "sender", {
      e: ss(escapeHTML(this.user.username))
    })
    if (this.user.badges) setbadge(this.sender, this.user.badges)
    this.el.append(this.sender)
  }
  private renderReply(): void {
    if (!this.s.embed) return
    const embed = this.s.embed
    const replysender = kelement("div", "name", { e: ss(escapeHTML(embed.user.username)) })
    const replymsg = kelement("div", "msg")
    if (embed.type === "deleted") {
      replymsg.innerHTML = `<i class="fa-solid fa-ban"></i> <i>${embed.user.id === db.me.id ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}</i>`
    } else if (embed.type === "audio" || embed.type === "file" || embed.type === "image" || embed.type === "video") {
      replymsg.innerHTML = mediaIcons[embed.type] || ""
    }

    if (embed.type === "voice") {
      replymsg.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat'
    } else if (embed.text) {
      replymsg.innerHTML += " " + ss(escapeHTML(embed.text), 20)
    } else {
      replymsg.innerHTML += " Media"
    }
    this.reply = kelement("div", "chp embed", { e: [replysender, replymsg] })
    this.el.append(this.reply)
  }
  private attachImage(eattach: HTMLDivElement, url: string, roomid: string, isTemp: boolean): void {
    const img = new Image()
    img.onerror = () => {
      img.remove()
      this.attachFile(eattach, url, roomid, isTemp)
    }
    img.src = isTemp ? url : `/file/media/${roomid}/${url}`
    img.alt = isTemp ? Date.now().toString(32) : url
    eattach.append(img)
  }
  private attachVideo(eattach: HTMLDivElement, url: string, roomid: string, isTemp: boolean): void {
    const vid = kelement("video")
    vid.onerror = () => {
      vid.remove()
      this.attachFile(eattach, url, roomid, isTemp)
    }
    vid.controls = true
    vid.src = isTemp ? url : `/file/media/${roomid}/${url}`
    eattach.append(vid)
  }
  private attachFile(eattach: HTMLDivElement, url: string, roomid: string, isTemp: boolean): void {
    const efile = kelement("a", "document", {
      a: { href: isTemp ? url : `/file/media/${roomid}/${url}`, target: "_blank", title: isTemp ? Date.now().toString(32) : url }
    })
    eattach.append(efile)
  }
  private renderAttach(isTemp: boolean): void {
    if (this.s.type !== "image" && this.s.type !== "video" && this.s.type !== "file" && this.s.type !== "audio") return
    if (!this.s.filesrc) return
    this.attach = kelement("div", "chp attach")
    if (this.s.type === "image") {
      this.attachImage(this.attach, this.s.filesrc, this.s.roomid, isTemp)
    } else if (this.s.type === "video") {
      this.attachVideo(this.attach, this.s.filesrc, this.s.roomid, isTemp)
    } else {
      this.attachFile(this.attach, this.s.filesrc, this.s.roomid, isTemp)
    }
    this.el.append(this.attach)
  }
  private renderCall(): void {
    // <div class="chp vc"><div class="vc-icon"></div><div class="vc-message"><p>Voice Call</p></div></div>
  }
  private renderText(): void {
    this.textMessage = kelement("p")
    this.textEdidted = kelement("span", "edited")
    const textParent = kelement("div", "chp text", { e: [this.textMessage, this.textEdidted] })
    this.el.append(textParent)
    if (this.s.text) this.textMessage.innerHTML = escapeHTML(this.s.text)
  }
  private renderTime(): void {
    this.timestamp = kelement("div", "ts", { e: sdate.parseTime(this.s.timestamp) })
    this.sendStatus = kelement("div", "status")
    const timeParent = kelement("div", "chp time", { e: [this.timestamp, this.sendStatus] })
    this.el.append(timeParent)
  }
  set edit(text: string) {
    this.s.text = text
    this.s.edittime = Date.now()
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
  }
  get embeded(): IMessageEmbed {
    const embedData: IMessageEmbed = { user: this.user, id: this.s.id }
    if (this.s.type === "deleted") embedData.deleted = true
    if (this.s.type === "file" || this.s.type === "image" || this.s.type === "video" || this.s.type === "audio") embedData.media = this.s.type
    if (this.s.text) embedData.text = this.s.text
    return embedData
  }
  get id(): string {
    return this.s.id
  }
  set id(message_id: string) {
    this.s.id = message_id
  }
  setStatus(statusText: TStatusText): void {
    this.sendStatus.innerHTML = statusIcon[statusText]
    if (statusText === "failed") {
      this.sendStatus.classList.add("btn")
    } else {
      this.sendStatus.classList.remove("btn")
    }
  }
  toHTML(): HTMLDivElement {
    return this.el
  }
  run(isTemp?: boolean): this {
    this.init(isTemp || false)
    return this
  }
}
