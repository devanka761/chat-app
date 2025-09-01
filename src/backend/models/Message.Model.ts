import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IMessage } from "../types/message.types"

export interface IMessageDocument extends IMessage, Document {
  toJSON(options?: ToObjectOptions): IMessage
}

export type IMessageModel = Model<IMessageDocument>

const schema = new Schema({
  id: { type: String, required: true },
  user: { type: String, required: true },
  ts: { type: Number, required: true },
  readers: { type: [String] },
  text: { type: String },
  type: { type: String, default: "text" },
  edited: { type: Number, default: 0 },
  source: { type: String },
  deleted: { type: Boolean },
  replyTo: { type: String },
  duration: { type: Number },
  call: { type: Number }
})

const Message: IMessageModel = model<IMessageDocument, IMessageModel>("Message", schema)

export default Message
