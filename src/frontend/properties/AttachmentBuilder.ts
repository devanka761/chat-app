import { kel } from "../helper/kel"
import mediaCheck from "../manager/mediaCheck"
import RoomForm from "../pm/parts/RoomForm"

const file_format_regex = /\.([a-zA-Z0-9]+)$/

export default class AttachmentBuilder {
  public name: string
  public src?: string
  public form: RoomForm
  private el: HTMLDivElement
  private file: File
  private media: HTMLDivElement
  private btnCancel: HTMLDivElement
  constructor(s: { file: File; form: RoomForm }) {
    this.file = s.file
    this.form = s.form
    this.name = s.file.name
  }
  createElement(): void {
    this.media = kel("div", "media")
    this.btnCancel = kel("div", "btn btn-close", {
      e: '<i class="fa-duotone fa-circle-x"></i>'
    })
    const right = kel("div", "close", { e: this.btnCancel })
    this.el = kel("div", "attach", { e: [this.media, right] })
  }
  close(): void {
    this.el.remove()
    this.form.attachment = null
  }
  clickHandler(): void {
    this.btnCancel.onclick = () => this.form.closeAttachment()
  }
  get html(): HTMLDivElement {
    return this.el
  }
  clearMedia(): void {
    while (this.media.lastChild) {
      this.media.lastChild.remove()
    }
  }
  private setImage(src: string): void {
    this.clearMedia()
    if (typeof src !== "string") return this.setDocument()
    const parent = kel("div", "img")
    const img = new Image()
    img.alt = this.name
    const filename = kel("div", "name")
    filename.innerText = this.name
    img.onerror = async () => {
      img.remove()
      filename.remove()
      parent.remove()
      return this.setDocument()
    }
    img.onload = () => {
      this.form.growArea()
    }
    parent.append(img)
    this.media.append(parent, filename)
    img.src = src
  }
  private setVideo(src: string): void {
    this.clearMedia()
    if (typeof src !== "string") return this.setDocument()

    const parent = kel("div", "img")

    const filename = kel("div", "name")
    filename.innerText = this.name

    const vid = kel("video")
    vid.volume = 0
    vid.controls = false
    vid.onerror = () => {
      vid.remove()
      filename.remove()
      parent.remove()
      return this.setDocument()
    }
    vid.oncanplay = () => {
      this.form.growArea()
    }
    parent.append(vid)
    this.media.append(parent, filename)
    vid.src = src
  }
  private setDocument(text?: string): void {
    if (!text) text = this.name
    this.clearMedia()
    const p = kel("p")
    const file_extension = text.match(file_format_regex)?.[1]
    const parse_extension = file_extension ? `.${file_extension}` : ".dvnkz"
    const parse_name = text.replace(parse_extension, "")
    p.innerText = parse_name + (file_extension ? `.${file_extension}` : "")
    const parent = kel("div", "document", { e: p })
    this.media.append(parent)
    this.form.growArea()
  }
  private async renderFile(): Promise<void> {
    const filesrc: string = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result?.toString() as string)
      reader.readAsDataURL(this.file)
    })
    this.src = filesrc
    const media_extension = mediaCheck(this.name)
    if (media_extension === "image") {
      this.setImage(this.src)
    } else if (media_extension === "video") {
      this.setVideo(this.src)
    } else {
      this.setDocument()
    }
  }
  private init(): void {
    this.createElement()
    this.clickHandler()
    this.setDocument("Loading File ...")
    this.renderFile()
  }
  run(): this {
    this.init()
    return this
  }
}
