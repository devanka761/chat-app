import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import MessageBuilder from "../../props/room/MessageBuilder"
import { MessagesAPI } from "../../props/room/MessagesAPI"
import {} from "../../../types/message.types"
import Room from "../../content/Room"

export default class RoomField {
  readonly role: string
  public isLocked: boolean
  private room: Room
  private el: HTMLDivElement
  private middle: HTMLDivElement
  public list: MessagesAPI
  private preload: HTMLDivElement | undefined | null
  private autoScroll: boolean
  private mediaText: HTMLSpanElement
  constructor(s: { room: Room }) {
    this.role = "roomfield"
    this.isLocked = false
    this.autoScroll = false
    this.room = s.room
    this.list = new MessagesAPI({ data: [] })
  }
  private createElement() {
    this.preload = kel("div", "preload", { e: '<i class="fa-solid fa-circle-notch fa-spin fa-fw"></i>' })
    this.mediaText = kel("span", "mediatext", { e: lang.ROOM_TO_LOAD })
    this.preload.append(this.mediaText)
    this.el = kel("div", "chatlist asset-loading", { e: this.preload })
  }
  send(message: MessageBuilder): MessageBuilder {
    this.list.add(message)
    this.el.append(message.html)
    if (this.autoScroll) {
      this.scrollToBottom()
    }
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
  setMediaText(current: string): void {
    this.mediaText.innerHTML = `${lang.ROOM_TO_LOAD}: ${current}`
  }
  preloaded(btnGotolast: HTMLDivElement): void {
    if (this.preload && this.el.contains(this.preload)) this.el.removeChild(this.preload)
    this.el.classList.remove("asset-loading")
    this.scrollToBottom()
    btnGotolast.onclick = () => this.scrollToBottom()
  }
  private scrollToBottom(): void {
    this.el.scrollTop = this.el.scrollHeight - this.el.clientHeight
  }
  private checkGoToLast(): void {
    if (this.autoScroll) {
      this.room.hideGotolast()
    } else {
      this.room.showGotolast()
    }
  }
  listenScroll(): void {
    this.el.onscroll = () => {
      const currentScroll = this.el.scrollHeight - this.el.scrollTop
      const targetScroll = this.el.clientHeight + 70
      this.autoScroll = currentScroll <= targetScroll
      this.checkGoToLast()
    }
  }
  run(middle: HTMLDivElement) {
    this.middle = middle
    this.createElement()
    this.middle.append(this.el)
    this.listenScroll()
  }
}
