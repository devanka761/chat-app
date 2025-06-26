import { kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import db from "../../manager/db"
// import { RoomFormContent } from "../../types/room.types"
import Room from "../content/Room"
import ReplyBuilder from "../../properties/ReplyBuilder"
import AttachmentBuilder from "../../properties/AttachmentBuilder"
import EditBuilder from "../../properties/EditBuilder"
import MessageWritter from "../../properties/MessageWritter"

export default class RoomForm {
  readonly role: string
  public isLocked: boolean
  public room: Room
  private bottom: HTMLDivElement
  private el: HTMLDivElement
  // private btnEmoji: HTMLDivElement
  private btnAttach: HTMLDivElement
  private btnImage: HTMLDivElement
  private btnVoice: HTMLDivElement
  private textarea: HTMLTextAreaElement
  private canSend: boolean
  private downed: Set<string>
  public reply: ReplyBuilder | null
  public edit: EditBuilder | null
  public attachment: AttachmentBuilder | null
  constructor({ room }) {
    this.role = "roomform"
    this.isLocked = false
    this.room = room
    this.canSend = false
    this.downed = new Set()
  }
  private createElement(): void {
    // this.btnEmoji = kel("div", "btn btn-emoji", { e: `<i class="fa-solid fa-face-smile"></i>` })
    // const eemoji = kel("div", "emoji", { e: this.btnEmoji })
    this.textarea = kel("textarea")
    this.textarea.name = "content-input"
    this.textarea.id = "content-input" + this.room.data.id + Date.now().toString(36)
    this.textarea.maxLength = 500
    this.textarea.placeholder = lang.TYPE_HERE
    const etextbox = kel("div", "textbox", { e: this.textarea })
    this.btnAttach = kel("div", "btn btn-attach", { e: `<i class="fa-solid fa-paperclip"></i>` })
    this.btnImage = kel("div", "btn btn-image", { e: `<i class="fa-solid fa-camera-retro"></i>` })
    const eactions = kel("div", "actions", { e: [this.btnAttach, this.btnImage] })
    const einput = kel("div", "input", { e: [/*eemoji,*/ etextbox, eactions] })
    this.btnVoice = kel("div", "btn btn-voice", { e: `<i class="fa-solid fa-microphone"></i>` })
    const evoice = kel("div", "voice", { e: this.btnVoice })
    this.el = kel("div", "field", { e: [einput, evoice] })
  }
  private btnListener(): void {
    this.textarea.oninput = () => this.growArea()
    this.textarea.onkeydown = (e) => this.keyDown(e)
    this.textarea.onkeyup = (e) => this.keyUp(e)
    this.btnImage.onclick = () => this.findFile(true)
    this.btnAttach.onclick = () => this.findFile()
    this.btnVoice.onclick = () => {
      if (this.canSend) {
        // this.textarea.focus()
        return this.sendMessage()
      }
      this.clearForm()
      this.room.recorder.run(this.bottom)
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
    const text = this.textarea.value.toString()

    if (this.isLocked) return
    if (!this.canSend) return

    const writter = new MessageWritter().setUserId(db.me.id).setText(text).setTimeStamp()

    if (this.reply) writter.setReply(this.reply.id)

    if (this.attachment && this.attachment.src) {
      writter.addFile({ name: this.attachment.name, src: this.attachment.src })
    }

    if (this.edit) writter.setEdit(this.edit.id)

    if (!writter.isValid) return

    this.room.sendWritter(writter.toJSON())
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
    if (this.edit) this.closeEdit()
    if (this.attachment) this.closeAttachment()
    this.attachment = new AttachmentBuilder({ file: file, form: this })
    this.attachment.run()
    this.bottom.prepend(this.attachment.html)
    if (this.reply) this.bottom.prepend(this.reply.html)
    this.growArea()
    this.autofocus()
  }
  closeAttachment(): void {
    if (!this.attachment) return
    this.attachment.close()
    this.growArea()
    this.autofocus()
  }
  setReply(msgid: string): void {
    if (this.edit) this.closeEdit()
    if (this.reply) this.closeReply()
    this.reply = new ReplyBuilder({ id: msgid, form: this })
    this.reply.run()
    this.bottom.prepend(this.reply.html)
    this.growArea()
    this.autofocus()
  }
  closeReply(): void {
    if (!this.reply) return
    this.reply.close()
    this.growArea()
  }
  setEdit(msgid: string): void {
    if (this.reply) this.closeReply()
    if (this.attachment) this.closeAttachment()
    if (this.edit) this.closeEdit()
    this.edit = new EditBuilder({ id: msgid, form: this })
    this.edit.run()
    this.bottom.prepend(this.edit.html)
    this.growArea()
    this.autofocus()
  }
  closeEdit(): void {
    if (!this.edit) return
    this.edit.close()
    this.textarea.value = ""
    this.growArea()
  }
  setText(msg: string): void {
    this.textarea.value = msg
    this.textarea.select()
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
    const attachHeight: number = this.attachment?.html.clientHeight || 0
    const replyHeight: number = this.reply?.html.clientHeight || 0
    const editHeight: number = this.edit?.html.clientHeight || 0
    const mediaHeight: number = attachHeight + replyHeight + editHeight

    this.textarea.style.height = "24px"
    const textareaHeight = this.textarea.scrollHeight > 80 ? 80 : this.textarea.scrollHeight
    this.textarea.style.height = `${textareaHeight}px`
    const currHeight: number = textareaHeight < 30 ? textareaHeight + mediaHeight + 31 : textareaHeight + mediaHeight + 24
    this.room.resizeMiddle(currHeight)
  }
  private autofocus(): void {
    this.textarea.focus()
  }
  private async focus(): Promise<void> {
    this.textarea.readOnly = true
    await modal.waittime(20)
    this.textarea.focus()
    this.textarea.readOnly = false
  }
  private async firstFocus() {
    await modal.waittime(580)
    this.focus()
  }
  close(): void {
    if (this.el) this.bottom.removeChild(this.el)
  }
  open() {
    this.bottom.appendChild(this.el)
  }
  run(bottom: HTMLDivElement): void {
    this.bottom = bottom
    this.createElement()
    this.bottom.append(this.el)
    this.btnListener()
    this.firstFocus()
  }
}
