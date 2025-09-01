import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IChat } from "../types/chat.types"

export interface IChatDocument extends IChat, Document {
  toJSON(options?: ToObjectOptions): IChat
}

export type IChatModel = Model<IChatDocument>

const schema = new Schema({
  id: { type: String, required: true },
  users: { type: [{ type: String, required: true }], required: true },
  friend: { type: Boolean },
  key: { type: String },
  owner: { type: String },
  name: { type: String },
  image: { type: String },
  type: { type: String, required: true },
  badges: { type: [{ type: Number }] },
  link: { type: String },
  lastName: { type: Number },
  ts: { type: Number }
})

const Chat: IChatModel = model<IChatDocument, IChatModel>("Chat", schema)

export default Chat
