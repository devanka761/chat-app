import { IMessageWriter, IMessageWriterFiles, IMessageWriterType, IMessageWriterVoice } from "../types/message.types"

export default class MessageWriter {
  public readonly data: IMessageWriter
  constructor(data: IMessageWriter = {}) {
    this.data = { ...data }
  }
  setText(text: string): this {
    if (!this.data.type) this.setType("text")
    this.data.text = text
    return this
  }
  setType(type: IMessageWriterType): this {
    this.data.type = type
    return this
  }
  setUserId(userid: string): this {
    if (!this.data.type) this.setType("text")
    this.data.userid = userid
    return this
  }
  setReply(replyid: string): this {
    if (!this.data.type) this.setType("text")
    this.data.reply = replyid
    return this
  }
  addVoice(filesrc: IMessageWriterVoice): this {
    this.data.type = "audio"
    this.data.filesrc = filesrc
    return this
  }
  addFile(filesrc: IMessageWriterFiles): this {
    this.data.type = "file"
    this.data.filesrc = filesrc.src
    this.data.filename = filesrc.name
    return this
  }
  setTimeStamp(date?: number): this {
    if (!this.data.type) this.setType("text")
    this.data.timestamp = date || Date.now()
    return this
  }
  addWatch(...userids: string[]): this {
    if (!this.data.type) this.setType("text")
    if (this.data.watch) this.data.watch.push(...userids)
    else this.data.watch = userids

    return this
  }
  setEdit(editid: string): this {
    if (!this.data.type) this.setType("text")
    this.data.edit = editid
    return this
  }
  toJSON(): IMessageWriter {
    if (!this.data.type) this.setType("text")
    return { ...this.data }
  }
}
