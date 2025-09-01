import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IComment } from "../types/comment.types"

export interface ICommentDocument extends IComment, Document {
  toJSON(options?: ToObjectOptions): IComment
}

export type ICommentModel = Model<ICommentDocument>

const schema = new Schema({
  id: { type: String, required: true },
  to: { type: String, required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
  ts: { type: Number, required: true }
})

const Comment: ICommentModel = model<ICommentDocument, ICommentModel>("Comment", schema)

export default Comment
