import { kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import MessageBuilder from "../../properties/MessageBuilder"
import { MessagesAPI } from "../../properties/MessagesAPI"
import {} from "../../types/message.types"
import Room from "../content/Room"

export default class RoomField {
  readonly role: string
  public isLocked: boolean
  private room: Room
  private el: HTMLDivElement
  private middle: HTMLDivElement
  public list: MessagesAPI
  private preload: HTMLDivElement | undefined | null
  constructor(s: { room: Room }) {
    this.role = "roomfield"
    this.isLocked = false
    this.room = s.room
    this.list = new MessagesAPI({ data: [] })
  }
  private createElement() {
    this.preload = kel("div", "preload", { e: `<i class="fa-solid fa-circle-notch fa-spin fa-fw"></i> ${lang.LOADING}` })
    this.el = kel("div", "chatlist asset-loading", { e: this.preload })
  }
  send(message: MessageBuilder): MessageBuilder {
    this.list.add(message)
    this.el.append(message.html)
    return message
  }
  remove(msg: string | MessageBuilder): void {
    const message: MessageBuilder | null = typeof msg === "string" ? this.list.get(msg) : msg

    if (message) {
      this.list.remove(msg)
      const card = message.html
      if (this.el.contains(card)) {
        this.el.removeChild(card)
      }
    }
  }
  get html(): HTMLDivElement {
    return this.el
  }
  scrollToBottom(): void {
    if (this.preload && this.el.contains(this.preload)) this.el.removeChild(this.preload)
    this.el.classList.remove("asset-loading")
    this.el.scrollTop = this.el.scrollHeight
  }
  run(middle: HTMLDivElement) {
    this.middle = middle
    this.createElement()
    this.middle.append(this.el)
  }
}
