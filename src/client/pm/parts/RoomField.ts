import kelement from "../../helper/kelement"
import MessageBuilder from "../../main/MessageBuilder"
import { IMessageBuilder, IMessageWriter } from "../../types/message.types"
import Room from "../content/Room"

export default class RoomField {
  readonly id: string
  public isLocked: boolean
  private room: Room
  private messages?: IMessageWriter[]
  private el: HTMLDivElement
  private middle: HTMLDivElement
  constructor(s: { room: Room; messages?: IMessageWriter[] }) {
    this.id = "roomfield"
    this.isLocked = false
    this.room = s.room
    this.messages = s.messages
  }
  private createElement() {
    this.el = kelement("div", "chatlist")
  }
  send(msg: IMessageBuilder, isTemp?: boolean): MessageBuilder {
    const message = new MessageBuilder(msg)
    this.room.list.add(message)
    this.el.append(message.run(isTemp).toHTML())
    return message
  }
  run(middle: HTMLDivElement) {
    this.middle = middle
    this.createElement()
    this.middle.append(this.el)
  }
}
