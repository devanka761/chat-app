import ChatBuilder from "./ChatBuilder"

export default class ChatsAPI {
  private data: ChatBuilder[]
  constructor({ data }: { data: ChatBuilder[] }) {
    this.data = data
  }
  get entries(): ChatBuilder[] {
    return this.data
  }
  get(user_chat_id: string): ChatBuilder | null {
    return this.data.find((usrch) => usrch.id === user_chat_id) || null
  }
  add(user_chat: ChatBuilder): this {
    this.data.push(user_chat)
    return this
  }
}
