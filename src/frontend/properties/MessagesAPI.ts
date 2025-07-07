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
  getByIndex(index: number): MessageBuilder | null {
    return this.data[index] || null
  }
  add(msg: MessageBuilder): this {
    this.data.push(msg)
    return this
  }
  remove(message: string | MessageBuilder): void {
    const msgid = typeof message === "string" ? message : message.id
    this.data = this.data.filter((msg) => msg.id !== msgid)
  }
}
