import { model, Model, Schema, ToObjectOptions } from "mongoose"

export interface IMetadata {
  id?: string
  version?: number
  groups?: number
  publicKey?: string
  privateKey?: string
}
export interface IMetadataDocument extends IMetadata, Document {
  toJSON(options?: ToObjectOptions): IMetadata
}

export type IMetadataModel = Model<IMetadataDocument>

const schema = new Schema({
  id: { type: String },
  version: { type: Number },
  groups: { type: Number },
  publicKey: { type: String },
  privateKey: { type: String }
})

const Metadata: IMetadataModel = model<IMetadataDocument, IMetadataModel>("Metadata", schema)

export default Metadata
