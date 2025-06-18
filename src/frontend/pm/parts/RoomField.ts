import { kel } from "../../helper/kel"
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
  constructor(s: { room: Room }) {
    this.role = "roomfield"
    this.isLocked = false
    this.room = s.room
    this.list = new MessagesAPI({ data: [] })
  }
  private createElement() {
    this.el = kel("div", "chatlist")
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
  run(middle: HTMLDivElement) {
    this.middle = middle
    this.createElement()
    this.middle.append(this.el)
  }
}
