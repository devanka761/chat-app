import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { PushSubscription } from "web-push"

export enum IAccountProvider {
  "github" = "github",
  "google" = "google",
  "discord" = "discord",
  "kirimin" = "kirimin"
}

export interface IAccountData {
  id: string
  email: string
  provider: IAccountProvider
}

export interface IAccount {
  id: string
  data: IAccountData[]
  push: PushSubscription
}
export interface IAccountDocument extends IAccount, Document {
  toJSON(options?: ToObjectOptions): IAccount
}

export type IAccountModel = Model<IAccountDocument>

const schema = new Schema({
  id: { type: String, required: true },
  data: [
    {
      id: { type: String, required: true },
      email: { type: String, required: true },
      provider: { type: String, required: true }
    }
  ],
  push: { type: Object }
})

const Account: IAccountModel = model<IAccountDocument>("Account", schema)

export default Account
