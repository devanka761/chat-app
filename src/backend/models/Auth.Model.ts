import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IAuth } from "../types/auth.types"

export interface IAuthDocument extends IAuth, Document {
  toJSON(options?: ToObjectOptions): IAuth
}

export type IAuthModel = Model<IAuthDocument>

const schema = new Schema({
  email: { type: String, required: true },
  otp: {
    code: { type: String || Number, required: true },
    expiry: { type: Number, required: true }
  },
  rate: { type: Number, required: true },
  cd: { type: Number }
})

const Auth = model<IAuthDocument, IAuthModel>("Auth", schema)

export default Auth
