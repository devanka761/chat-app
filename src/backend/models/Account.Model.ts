import { model, Model, Schema, ToObjectOptions } from "mongoose"
import { IAccount } from "../types/account.types"

export interface IAccountDocument extends IAccount, Document {
  toJSON(options?: ToObjectOptions): IAccount
}

export type IAccountModel = Model<IAccountDocument>

const schema = new Schema({
  id: { type: String, required: true },
  data: {
    type: [
      {
        id: { type: String, required: true },
        email: { type: String, required: true },
        provider: { type: String, required: true }
      }
    ],
    required: true
  }
})

const Account: IAccountModel = model<IAccountDocument, IAccountModel>("Account", schema)

export default Account
