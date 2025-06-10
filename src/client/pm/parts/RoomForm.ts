import { ss } from "../../helper/escaper"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import MessageWriter from "../../main/MessageWriter"
import db from "../../manager/db"
import mediaCheck from "../../manager/mediaCheck"
import { RoomFormContent } from "../../types/room.types"
import Room from "../content/Room"

const contents: RoomFormContent = {}
let editID: string | null = null

function createAttach() {
  const attachMedia = kelement("div", "media")
  const attachClose = kelement("div", "close", { e: `<div class="btn"><i class="fa-duotone fa-circle-x"></i></div>` })
  const attachCard = kelement("div", "attach", { e: [attachMedia, attachClose] })
  return { attachCard, attachMedia, attachClose }
}
export default class RoomForm {
  readonly id: string
  public isLocked: boolean
  private room: Room
  private bottom: HTMLDivElement
  private el: HTMLDivElement
  private btnEmoji: HTMLDivElement
  private btnAttach: HTMLDivElement
  private btnImage: HTMLDivElement
  private btnVoice: HTMLDivElement
  private textarea: HTMLTextAreaElement
  private canSend: boolean
  private downed: Set<string>
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
    this.textarea.name = "content-input" + this.room.data.id
    this.textarea.id = "content-input" + +this.room.data.id
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
    if (contents.rep) messageWriter.setReply(contents.rep)
    if (contents.file) messageWriter.addFile(contents.file)
    if (contents.voice) messageWriter.addVoice(contents.voice)
    if (editID) messageWriter.setEdit(editID)
    messageWriter.setTimeStamp()
    this.room.sendMessage(messageWriter, true)
    this.clearForm()
  }
  private clearForm() {
    this.closeAttach()
    this.closeEdit()
    this.textarea.value = ""
  }
  private findFile(imageOnly?: boolean): void {
    const inp = document.createElement("input")
    inp.type = "file"
    if (imageOnly) inp.accept = "image/*,video/*,video/x-matroska"
    inp.onchange = async () => {
      this.closeEdit()
      this.closeAttach()
      if (!inp.files || !inp.files[0]) return
      const { attachCard, attachMedia, attachClose } = createAttach()
      this.bottom.prepend(attachCard)
      this.attDocument(attachMedia, "Loading File ...")

      const file = inp.files[0]

      const filesrc: string = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result?.toString() || "null")
        reader.readAsDataURL(file)
      })
      while (attachMedia.lastChild) attachMedia.lastChild.remove()
      const fileblob = URL.createObjectURL(file)
      contents.file = {
        name: file.name,
        src: filesrc
      }

      const mediaExtension = mediaCheck(file.name)
      if (mediaExtension === "image") {
        this.attImage(attachMedia, file.name, fileblob)
      } else if (mediaExtension === "video") {
        this.attVideo(attachMedia, file.name, fileblob)
      } else {
        this.attDocument(attachMedia, file.name)
      }
      const repembed = this.bottom.querySelector(".embed")
      if (repembed) this.bottom.prepend(repembed)
      this.growArea()
      attachClose.onclick = () => this.closeAttach()
      this.focus()
      inp.remove()
    }
    inp.click()
  }
  private attImage(eattach: HTMLDivElement, filename: string, filesrc: string): void {
    if (typeof filesrc !== "string") return this.attDocument(eattach, filename)
    const eimg = kelement("div", "img")
    const img = new Image()
    img.alt = filename
    const ename = kelement("div", "name")
    ename.innerText = filename
    img.onerror = async () => {
      img.remove()
      eimg.remove()
      ename.remove()
      this.attDocument(eattach, filename)
      this.growArea()
    }
    img.onload = () => {
      this.growArea()
    }
    eimg.append(img)
    eattach.append(eimg, ename)
    img.src = filesrc
  }
  private attVideo(eattach: HTMLDivElement, filename: string, filesrc: string): void {
    if (typeof filesrc !== "string") return this.attDocument(eattach, filename)
    const evid = kelement("div", "img")
    const ename = kelement("div", "name")
    ename.innerText = filename
    const vid = kelement("video")
    vid.volume = 0
    vid.controls = false
    vid.onerror = async () => {
      vid.remove()
      evid.remove()
      ename.remove()
      this.attDocument(eattach, filename)
      this.growArea()
    }
    vid.oncanplay = () => {
      this.growArea()
    }
    evid.append(vid)
    eattach.append(evid, ename)
    vid.src = filesrc
  }
  private attDocument(eattach: HTMLDivElement, filename: string): void {
    const p = kelement("p")
    const docFormat = /\.([a-zA-Z0-9]+)$/
    const docExt = filename.match(docFormat)?.[1]
    const extParsed = docExt ? `.${docExt}` : ".dvnkz"
    const nameParsed = ss(filename, 30).replace(extParsed, "")
    p.innerText = nameParsed + (docExt ? `.${docExt}` : "")
    const edoc = kelement("div", "document", { e: p })
    eattach.append(edoc)
    this.growArea()
  }
  private closeAttach(): void {
    const eattach = this.bottom.querySelector(".attach")
    if (eattach) eattach.remove()
    delete contents.file
    this.growArea()
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
  private growArea(): void {
    if (!this.canSend && (this.textarea.value.trim().length > 0 || contents.file?.src)) {
      this.canSend = true
      this.btnVoice.innerHTML = `<i class="fa-solid fa-paper-plane-top"></i>`
    } else if (this.canSend && this.textarea.value.trim().length < 1 && !contents.file?.src) {
      this.canSend = false
      this.btnVoice.innerHTML = `<i class="fa-solid fa-microphone"></i>`
    }
    const eattach: HTMLDivElement | null = this.bottom.querySelector(".attach")
    const attachHeight: number = eattach?.offsetHeight || 0
    const eembed: HTMLDivElement | null = this.bottom.querySelector(".embed")
    const embedHeight: number = eembed?.offsetHeight || 0
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
