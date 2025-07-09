import { epm, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import xhr from "../../helper/xhr"
import adap from "../../main/adaptiveState"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"
import Posts from "./Posts"

export default class CreatePost implements PrimaryClass {
  king?: "center" | "content" | undefined
  isLocked: boolean
  role: string
  private el: HTMLDivElement
  private btnBack: HTMLDivElement
  private posts: Posts
  classBefore?: PrimaryClass
  private field: HTMLDivElement
  private imgPreview: HTMLDivElement
  private textarea: HTMLTextAreaElement
  private btnCancel: HTMLDivElement
  private btnSubmit: HTMLDivElement
  private btnChooser: HTMLDivElement
  private ifile: string | null
  private iname: string | null
  constructor(s: { posts: Posts; classBefore?: PrimaryClass }) {
    this.posts = s.posts
    this.classBefore = s.classBefore
    this.king = "content"
    this.role = "postcreation"
    this.isLocked = false
    this.ifile = null
    this.iname = null
  }
  private createElement(): void {
    this.el = kel("div", "CreatePost pmcontent")
    this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    const etitle = kel("div", "sect-title", { e: lang.APP_CREATE_POST })
    const top = kel("div", "top", { e: [this.btnBack, etitle] })
    this.el.append(top)
  }
  private writeForm(): void {
    const bottom = kel("div", "bottom")
    this.el.append(bottom)
    const field = kel("div", "field")
    this.btnChooser = kel("div", "btn btn-choose")
    this.btnChooser.innerHTML = `<i class="fa-solid fa-image"></i> ${lang.POSTS_CHOOSE_IMG}`

    this.imgPreview = kel("div", "preview")
    this.textarea = kel("textarea")
    this.textarea.name = "post-text"
    this.textarea.id = "post-text"
    this.textarea.placeholder = lang.TYPE_HERE
    this.textarea.maxLength = 300
    this.textarea.autocomplete = "off"
    const actions = kel("div", "actions")
    this.btnCancel = kel("div", "btn btn-cancel", { e: lang.CANCEL })
    this.btnSubmit = kel("div", "btn btn-submit", { e: lang.POSTS_SHARE })
    this.btnSubmit.innerHTML = `${lang.POSTS_SHARE} <i class="fa-solid fa-arrow-up"></i>`
    actions.append(this.btnCancel, this.btnSubmit)
    field.append(this.btnChooser, this.imgPreview, this.textarea)
    bottom.append(field, actions)
    setTimeout(() => this.fileChooser(), 250)
  }
  private fileChooser(): void {
    const inp = kel("input")
    inp.type = "file"
    inp.accept = "image/*"
    inp.id = "post-file"
    inp.name = "post-file"
    inp.onchange = () => {
      if (this.isLocked) return
      if (!inp.files || !inp.files[0]) return
      const file = inp.files[0]
      this.isLocked = true
      const reader = new FileReader()
      reader.onload = () => this.renPreview(reader.result?.toString(), file.name)
      reader.readAsDataURL(file)
    }
    inp.click()
    inp.remove()
  }
  private btnListener(): void {
    this.btnBack.onclick = () => adap.swipe(this.classBefore)
    this.btnCancel.onclick = () => adap.swipe(this.classBefore)
    this.btnSubmit.onclick = () => this.uploadPost()
    this.btnChooser.onclick = () => this.fileChooser()
  }
  private async renPreview(src?: string | null, filename?: string): Promise<void> {
    if (!src || !filename) {
      await modal.alert({ ic: "image-slash", msg: lang.IMG_ERR })
      this.isLocked = false
      return
    }
    const img = new Image()
    img.onerror = async () => {
      if (this.imgPreview.firstChild && this.ifile) {
        this.imgPreview.removeChild(this.imgPreview.firstChild)
      }
      this.ifile = null
      this.iname = null
      img.remove()
      this.isLocked = true
      await modal.alert({ ic: "image-slash", msg: lang.IMG_ERR })
      this.isLocked = false
      return
    }
    img.onload = () => {
      if (this.imgPreview.firstChild && this.ifile) {
        this.imgPreview.removeChild(this.imgPreview.firstChild)
      }
      this.ifile = src
      this.iname = filename
      if (this.textarea.value.length < 1) {
        this.textarea.readOnly = true
        this.textarea.focus()
        setTimeout(() => {
          this.textarea.readOnly = false
        }, 250)
      }
    }
    this.imgPreview.append(img)
    img.alt = filename
    img.src = src
    this.isLocked = false
  }
  private async uploadPost(): Promise<void> {
    if (this.isLocked) return
    this.isLocked = true
    if (!this.ifile) {
      await modal.alert(lang.POST_NO_FILE)
      this.isLocked = false
      return this.fileChooser()
    }
    const posted = await modal.loading(
      xhr.upload(
        "/x/posts/new-post",
        {
          file: this.ifile,
          name: this.iname,
          text: this.textarea.value.trim()
        },
        true
      ),
      lang.UPLOADING
    )
    if (!posted || !posted.ok) {
      await modal.alert((lang[posted.msg] || lang.ERROR).replace("{SIZE}", "2.5 MB"))
      this.isLocked = false
      return
    }
    await modal.loading(modal.waittime(2000), lang.FINISHING)
    this.isLocked = false
    adap.swipe(this.classBefore)
  }
  update(): void {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.ifile = null
    this.iname = null
    this.isLocked = false
    this.el.remove()
  }
  run(): this {
    userState.content = this
    this.createElement()
    epm().append(this.el)
    this.writeForm()
    this.btnListener()
    return this
  }
}
