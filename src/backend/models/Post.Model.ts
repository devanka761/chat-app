import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IPost } from "../types/post.types"

export interface IPostDocument extends IPost, Document {
  toJSON(options?: ToObjectOptions): IPost
}

export type IPostModel = Model<IPostDocument>

const schema = new Schema({
  id: { type: String, required: true },
  user: { type: String, required: true },
  ts: { type: Number, required: true },
  image: { type: String, required: true },
  text: { type: String },
  likes: { type: [String] }
})

const Post: IPostModel = model<IPostDocument, IPostModel>("Post", schema)

export default Post
