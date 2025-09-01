import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { ICall } from "../types/call.types"

export interface ICallDocument extends ICall, Document {
  toJSON(options?: ToObjectOptions): ICall
}

export type ICallModel = Model<ICallDocument>

const schema = new Schema({
  id: { type: String, required: true },
  type: { type: Number, required: true },
  owner: { type: String, required: true },
  startAt: { type: Number, required: true },
  users: {
    type: [{ id: { type: String, required: true }, joined: { type: Boolean, required: true } }],
    required: true
  }
})

const Call: ICallModel = model<ICallDocument, ICallModel>("Call", schema)

export default Call
