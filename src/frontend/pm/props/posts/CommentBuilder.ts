import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import sdate from "../../../helper/sdate"
import setbadge from "../../../helper/setbadge"
import db from "../../../manager/db"
import { IUserF } from "../../../types/db.types"
import { ICommentF } from "../../../types/posts.types"
import Comments from "../../parts/posts/Comments"

export default class CommentBuilder {
  isLocked: boolean
  private el: HTMLDivElement
  user: IUserF
  comment: ICommentF
  parent: Comments
  private btnDelete?: HTMLDivElement
  constructor(s: { parent: Comments; comment: ICommentF; user: IUserF }) {
    this.parent = s.parent
    this.comment = s.comment
    this.user = s.comment.user
    this.isLocked = false
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "card")
    if (this.user.id === db.me.id) this.el.classList.add("me")
  }
  private renPhoto(): void {
    const imgParent = kel("div", "photo")
    this.el.append(imgParent)

    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.alt = this.user.username
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    imgParent.append(img)
  }
  private renData(): void {
    const dataParent = kel("div", "data")
    this.el.append(dataParent)

    const eUser = kel("div", "data-user")
    const username = kel("span", "username")
    username.innerText = this.user.username
    if (this.user.badges) setbadge(username, this.user.badges)
    const timestamp = kel("span", "timestamp")
    timestamp.innerHTML = sdate.timeago(this.comment.ts, true)
    eUser.append(username, timestamp)

    const eText = kel("div", "data-text")
    const p = kel("p")
    p.innerText = this.comment.text
    eText.append(p)

    dataParent.append(eUser, eText)
  }
  private renActions(): void {
    if (this.user.id !== db.me.id) return
    const eAction = kel("div", "cmt-actions")
    this.el.append(eAction)
    this.btnDelete = kel("div", "btn btn-delcomment")
    this.btnDelete.innerHTML = '<i class="fa-solid fa-trash-can fa-fw"></i>'
    eAction.append(this.btnDelete)
  }
  private btnListener(): void {
    if (this.btnDelete)
      this.btnDelete.onclick = async () => {
        const confDelete = await modal.confirm({ ic: "circle-question", msg: lang.POST_DELETE_MSG, okx: lang.CONTENT_CONFIRM_DELETE })
        console.log(confDelete)
      }
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.createElement()
    this.renPhoto()
    this.renData()
    this.renActions()
    this.btnListener()
    return this
  }
}
