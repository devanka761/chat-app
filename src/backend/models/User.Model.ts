import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IUser } from "../types/user.types"

export interface IUserDocument extends IUser, Document {
  toJSON(options?: ToObjectOptions): IUser
}

export type UserModel = Model<IUserDocument>

const schema = new Schema({
  id: { type: String, required: true },
  image: { type: String },
  username: { type: String, required: true },
  displayname: { type: String, required: true },
  bio: { type: String },
  badges: { type: [Number] },
  socket: { type: String },
  push: { type: Object },
  req: { type: [String] },
  lastUsername: { type: Number },
  lastDisplayName: { type: Number },
  lastBio: { type: Number }
})

const User = model<IUserDocument, UserModel>("User", schema)

export default User
