import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import sdate from "../../../helper/sdate"
import setbadge from "../../../helper/setbadge"
import xhr from "../../../helper/xhr"
import adap from "../../../main/adaptiveState"
import db from "../../../manager/db"
import socketClient from "../../../manager/socketClient"
import { IUserF } from "../../../types/db.types"
import { IPostF } from "../../../types/posts.types"
import Account from "../../content/Account"
import Posts from "../../content/Posts"
import Profile from "../../content/Profile"

export default class PostCard {
  isLocked: boolean
  user: IUserF
  private el: HTMLDivElement
  parent: Posts
  post: IPostF
  private btnLikes: HTMLDivElement
  private btnComments: HTMLDivElement
  private btnDelete: HTMLDivElement
  private likesCount: HTMLSpanElement
  private likeIcon: HTMLElement
  private commentsCount: HTMLSpanElement
  constructor(s: { parent: Posts; post: IPostF }) {
    this.isLocked = false
    this.parent = s.parent
    this.post = s.post
    this.user = s.post.user
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "card")
  }
  private renUser(): void {
    const euser = kel("div", "user")
    const imgparent = kel("div", "img")
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.alt = this.user.username
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    imgparent.append(img)
    const names = kel("div", "name")
    const displayName = kel("div", "dname")
    displayName.innerText = this.user.displayname
    if (this.user.badges) setbadge(displayName, this.user.badges)
    const timestamp = kel("div", "ts")
    timestamp.append(sdate.timeago(this.post.ts, true))
    names.append(displayName, timestamp)

    euser.append(imgparent, names)
    euser.onclick = () => {
      adap.swipe(this.user.id === db.me.id ? new Account({ classBefore: this.parent }) : new Profile({ user: this.user, classBefore: this.parent }))
    }
    this.el.append(euser)
  }
  private async renMedia(): Promise<void> {
    const media = kel("div", "media")
    this.el.append(media)
    const mediaPreloader = kel("div", "preloader")
    mediaPreloader.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'
    media.append(mediaPreloader)
    const img = new Image()
    img.onerror = () => (img.src = "/assets/error.jpg")
    img.onload = () => mediaPreloader.remove()
    img.alt = this.post.img
    img.src = `/file/post/${this.post.id}/${this.post.img}`
    media.append(img)
  }
  private renOptions(): void {
    const options = kel("div", "options")

    const optVisitor = kel("div", "opt-visitor")
    options.append(optVisitor)
    this.likesCount = kel("span")
    this.likesCount.innerHTML = this.post.likes >= 1 ? this.post.likes.toString() : ""
    this.likeIcon = kel("i", "fa-" + (this.post.liked ? "solid" : "regular") + " fa-heart")
    this.btnLikes = kel("div", "btn btn-likes", { e: [this.likeIcon, this.likesCount] })
    if (this.post.liked) {
      this.btnLikes.classList.add("liked")
    }
    this.commentsCount = kel("span")
    this.commentsCount.innerHTML = this.post.comments >= 1 ? this.post.comments.toString() : ""
    this.btnComments = kel("div", "btn btn-comments", { e: ['<i class="fa-regular fa-comment"></i>', this.commentsCount] })
    optVisitor.append(this.btnLikes, this.btnComments)

    if (this.user.id === db.me.id) {
      const optAuthor = kel("div", "opt-author")
      options.append(optAuthor)
      this.btnDelete = kel("div", "btn btn-delete", { e: `<i class="fa-regular fa-trash-xmark"></i>` })
      optAuthor.append(this.btnDelete)
    }
    this.el.append(options)
  }
  private renText(): void {
    if (!this.post.text) return
    const text = kel("div", "text")
    text.innerText = this.post.text
    this.el.append(text)
  }
  get html(): HTMLDivElement {
    return this.el
  }
  private btnListener() {
    this.btnLikes.onclick = async () => {
      if (this.isLocked) return
      this.setLike()
    }

    this.btnComments.onclick = async () => {
      if (this.isLocked) return
      this.isLocked = true
      await modal.alert({
        ic: "helmet-safety",
        msg: "UNDER MAINTENANCE"
      })
      this.isLocked = false
    }
    if (this.btnDelete)
      this.btnDelete.onclick = async () => {
        if (this.isLocked) return
        this.isLocked = true

        const confDelete = await modal.confirm({
          ic: "trash-xmark",
          msg: lang.POST_DELETE_MSG,
          okx: lang.CONTENT_CONFIRM_DELETE
        })
        if (!confDelete) {
          this.isLocked = false
          return
        }

        const postDeleted = await modal.loading(xhr.post(`/x/posts/delete-post/${this.post.id}`))
        if (!postDeleted || !postDeleted.ok) {
          await modal.alert(lang[postDeleted.msg])
          this.isLocked = false
          return
        }
        this.el.remove()
      }
  }
  private setLike(): void {
    if (this.post.liked) {
      socketClient.send({ type: "postunlike", postid: this.post.id })
      this.post.liked = false
      this.post.likes--
      this.likeIcon.setAttribute("class", "fa-regular fa-heart")
      this.btnLikes.classList.remove("liked")
      this.likesCount.innerHTML = this.post.likes >= 1 ? this.post.likes.toString() : ""
    } else {
      socketClient.send({ type: "postlike", postid: this.post.id })
      this.post.liked = true
      this.post.likes++
      this.likeIcon.setAttribute("class", "fa-solid fa-heart")
      this.btnLikes.classList.add("liked")
      this.likesCount.innerHTML = this.post.likes >= 1 ? this.post.likes.toString() : ""
    }
  }
  run(): this {
    this.createElement()
    this.renUser()
    this.renMedia()
    this.renOptions()
    this.renText()
    this.btnListener()
    return this
  }
}
