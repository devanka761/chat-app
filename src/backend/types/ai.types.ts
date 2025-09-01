import { Chat } from "@google/genai"

export interface IModelChat {
  id: string
  model: Chat
  rate: number
  ts: number
}
