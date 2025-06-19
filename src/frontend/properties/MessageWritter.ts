import mediaCheck from "../manager/mediaCheck"
import { MessageTypeF } from "../types/db.types"
import { IWritterF, IWritterFileF } from "../types/message.types"

const msgValidTypes = ["audio", "file", "video", "image"]

export default class MessageWritter {
  private data: IWritterF
  constructor(s?: IWritterF) {
    this.data = { ...s }
  }
  setText(text: string): this {
    if (!this.data.type) this.setType("text")
    this.data.text = text
    return this
  }
  setType(type: MessageTypeF): this {
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
  addVoice(filesrc: string): this {
    this.data.type = "audio"
    this.data.filesrc = filesrc
    return this
  }
  addFile(file: IWritterFileF): this {
    this.data.type = file.isVoice ? "voice" : mediaCheck(file.name) || "file"
    this.data.filesrc = file.src
    this.data.filename = file.name
    return this
  }
  setTimeStamp(date?: number): this {
    if (!this.data.type) this.setType("text")
    this.data.timestamp = date || Date.now()
    return this
  }
  setEdit(editid: string): this {
    if (!this.data.type) this.setType("text")
    this.data.edit = editid
    return this
  }
  toJSON(): IWritterF {
    if (!this.data.type) this.setType("text")
    return { ...this.data }
  }
  get isValid(): boolean {
    if (!this.data.type || this.data.type === "text") {
      if (!this.data.text || this.data.text.length < 1) return false
    }

    if (msgValidTypes.find((vt) => vt === this.data.type)) {
      if (!this.data.filename || !this.data.filesrc) return false
    }

    if (this.data.type === "voice" && !this.data.filesrc) return false

    if (this.data.text && this.data.text.length > 500) return false

    if (this.data.filename && this.data.filename.length > 100) return false
    return true
  }
}
