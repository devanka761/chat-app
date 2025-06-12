import MessageBuilder from "./MessageBuilder"

export class MessagesAPI {
  private data: MessageBuilder[]
  constructor({ data }: { data: MessageBuilder[] }) {
    this.data = data
  }
  get entries(): MessageBuilder[] {
    return this.data
  }
  get(message_id: string): MessageBuilder | null {
    return this.data.find((msg) => msg.id === message_id) || null
  }
  add(msg: MessageBuilder): this {
    this.data.push(msg)
    return this
  }
  delete(message_id: string): void {
    this.data = this.data.filter((msg) => msg.id === message_id)
  }
}
