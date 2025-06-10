import MessageBuilder from "./MessageBuilder"

export class MessagesAPI {
  private data: MessageBuilder[]
  constructor({ data }: { data: MessageBuilder[] }) {
    this.data = data
  }
  get(message_id: string): MessageBuilder | null {
    return this.data.find((msg) => msg.id === message_id) || null
  }
  add(msg: MessageBuilder): this {
    this.data.push(msg)
    return this
  }
}
