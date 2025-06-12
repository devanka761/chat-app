import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import MessageWriter from "../../properties/MessageWriter"
import db from "../../manager/db"
// import { RoomFormContent } from "../../types/room.types"
import Room from "../content/Room"
import ReplyBuilder from "../../properties/ReplyBuilder"
import AttachmentBuilder from "../../properties/AttachmentBuilder"

// const contents: RoomFormContent = {}
let editID: string | null = null

export default class RoomForm {
  readonly id: string
  public isLocked: boolean
  public room: Room
  private bottom: HTMLDivElement
  private el: HTMLDivElement
  private btnEmoji: HTMLDivElement
  private btnAttach: HTMLDivElement
  private btnImage: HTMLDivElement
  private btnVoice: HTMLDivElement
  private textarea: HTMLTextAreaElement
  private canSend: boolean
  private downed: Set<string>
  public reply: ReplyBuilder | null
  public attachment: AttachmentBuilder | null
  constructor({ room }) {
    this.id = "roomform"
    this.isLocked = false
    this.room = room
    this.canSend = false
    this.downed = new Set()
  }
  private createElement(): void {
    this.btnEmoji = kelement("div", "btn btn-emoji", { e: `<i class="fa-solid fa-face-smile"></i>` })
    const eemoji = kelement("div", "emoji", { e: this.btnEmoji })
    this.textarea = kelement("textarea")
    this.textarea.name = "content-input"
    this.textarea.id = "content-input" + this.room.data.id + Date.now().toString(36)
    this.textarea.maxLength = 500
    this.textarea.placeholder = lang.TYPE_HERE
    const etextbox = kelement("div", "textbox", { e: this.textarea })
    this.btnAttach = kelement("div", "btn btn-attach", { e: `<i class="fa-solid fa-paperclip"></i>` })
    this.btnImage = kelement("div", "btn btn-image", { e: `<i class="fa-solid fa-camera-retro"></i>` })
    const eactions = kelement("div", "actions", { e: [this.btnAttach, this.btnImage] })
    const einput = kelement("div", "input", { e: [eemoji, etextbox, eactions] })
    this.btnVoice = kelement("div", "btn btn-voice", { e: `<i class="fa-solid fa-microphone"></i>` })
    const evoice = kelement("div", "voice", { e: this.btnVoice })
    this.el = kelement("div", "field", { e: [einput, evoice] })
  }
  private btnListener(): void {
    this.textarea.oninput = () => this.growArea()
    this.textarea.onkeydown = (e) => this.keyDown(e)
    this.textarea.onkeyup = (e) => this.keyUp(e)
    this.btnImage.onclick = () => this.findFile(true)
    this.btnAttach.onclick = () => this.findFile()
    this.btnVoice.onclick = () => {
      if (this.canSend) {
        this.textarea.focus()
        return this.sendMessage()
      }
    }
  }
  private keyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    if (key === "shift") this.downed.add(key)
    if (key === "enter" && this.downed.has("shift") && this.canSend) {
      e.preventDefault()
      this.sendMessage()
    }
  }
  private keyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase()
    if (key === "shift" && this.downed.has(key)) this.downed.delete(key)
  }
  private sendMessage(): void {
    if (this.isLocked) return
    if (!this.canSend) return

    const messageWriter: MessageWriter = new MessageWriter()
    messageWriter.setText(this.textarea.value)
    messageWriter.setUserId(<string>db.me.id)
    if (this.reply) messageWriter.setReply(this.reply.id)
    if (this.attachment && this.attachment.src) {
      messageWriter.addFile({
        name: this.attachment.name,
        src: this.attachment.src
      })
    }
    // if (contents.voice) messageWriter.addVoice(contents.voice)
    if (editID) messageWriter.setEdit(editID)
    messageWriter.setTimeStamp()
    this.room.sendMessage(messageWriter, true)
    this.clearForm()
  }
  private clearForm() {
    this.closeAttachment()
    this.closeReply()
    this.closeEdit()
    this.textarea.value = ""
    this.growArea()
  }
  private findFile(imageOnly?: boolean): void {
    const inp = document.createElement("input")
    inp.type = "file"
    if (imageOnly) inp.accept = "image/*,video/*,video/x-matroska"
    inp.onchange = async () => {
      this.closeEdit()
      if (!inp.files || !inp.files[0]) return
      this.setAttachment(inp.files[0])
      inp.remove()
    }
    inp.click()
  }
  private setAttachment(file: File): void {
    if (this.attachment) this.attachment.close()
    this.attachment = new AttachmentBuilder({ file: file, form: this })
    this.attachment.run()
    this.bottom.prepend(this.attachment.html)
    if (this.reply) this.bottom.prepend(this.reply.html)
    this.growArea()
  }
  closeAttachment(): void {
    if (!this.attachment) return
    this.attachment.close()
    this.growArea()
  }
  setReply(msgid: string): void {
    if (this.reply) this.reply.close()
    this.reply = new ReplyBuilder({ id: msgid, form: this })
    this.reply.run()
    this.bottom.prepend(this.reply.html)
    this.growArea()
  }
  closeReply(): void {
    if (!this.reply) return
    this.reply.close()
    this.growArea()
  }
  setEdit(msgid: string): void {
    console.log(msgid)
  }
  private closeEdit(): void {
    const eedit = this.bottom.querySelector(".edit-embed")
    if (eedit) {
      eedit.remove()
      this.textarea.value = ""
    }
    editID = null
    this.growArea()
  }
  growArea(): void {
    if (!this.canSend && (this.textarea.value.trim().length > 0 || this.attachment?.src)) {
      this.canSend = true
      this.btnVoice.innerHTML = `<i class="fa-solid fa-paper-plane-top"></i>`
    } else if (this.canSend && this.textarea.value.trim().length < 1 && !this.attachment?.src) {
      this.canSend = false
      this.btnVoice.innerHTML = `<i class="fa-solid fa-microphone"></i>`
    }
    // const eattach: HTMLDivElement | null = this.bottom.querySelector(".attach")
    const attachHeight: number = this.attachment?.html?.offsetHeight || 0
    const embedHeight: number = this.reply?.html?.offsetHeight || 0
    const mediaHeight: number = attachHeight + embedHeight

    this.textarea.style.height = "24px"
    const textareaHeight = this.textarea.scrollHeight > 80 ? 80 : this.textarea.scrollHeight
    this.textarea.style.height = `${textareaHeight}px`
    const currHeight: number = textareaHeight < 30 ? textareaHeight + mediaHeight + 31 : textareaHeight + mediaHeight + 24
    this.room.resizeMiddle(currHeight)
  }
  private async focus(): Promise<void> {
    this.textarea.readOnly = true
    await modal.waittime(500)
    this.textarea.focus()
    await modal.waittime(100)
    this.textarea.readOnly = false
  }
  run(bottom: HTMLDivElement): void {
    this.bottom = bottom
    this.createElement()
    this.bottom.append(this.el)
    this.focus()
    this.btnListener()
  }
}
