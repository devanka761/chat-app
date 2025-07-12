import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import xhr from "../../../helper/xhr"
import db from "../../../manager/db"
import { ICommentF, IPostF, TCommentsF } from "../../../types/posts.types"
import Posts from "../../content/Posts"
import CommentBuilder from "../../props/posts/CommentBuilder"
import PostCard from "./PostCard"

export default class Comments {
  isLocked: boolean
  posts: Posts
  postcard: PostCard
  private el: HTMLDivElement
  private btnClose: HTMLDivElement
  private form: HTMLFormElement
  private box: HTMLDivElement
  private middle: HTMLDivElement
  private post: IPostF
  private input: HTMLInputElement
  private button: HTMLButtonElement
  private list: TCommentsF
  constructor(s: { posts: Posts; postcard: PostCard; post: IPostF }) {
    this.isLocked = false
    this.posts = s.posts
    this.post = s.post
    this.postcard = s.postcard
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "comments")
    this.box = kel("div", "box")
    this.el.append(this.box)
    const top = kel("div", "comments-top")
    const bottom = kel("div", "comments-bottom")
    this.middle = kel("div", "comments-mid")
    this.box.append(top, this.middle, bottom)
    const title = kel("div", "title", { e: lang.POST_COMMENT_TITLE })
    this.btnClose = kel("div", "btn btn-close")
    this.btnClose.innerHTML = '<i class="fa-duotone fa-circle-minus"></i>'
    top.append(title, this.btnClose)

    this.form = kel("form", "form")
    this.form.method = "post"
    this.form.action = `/x/posts/comment/add/${this.post.id}`
    this.form.id = `post-comment-form-${this.post.id}`
    bottom.append(this.form)

    this.input = kel("input", "input")
    this.input.type = "text"
    this.input.name = `post-comment-input-${this.post.id}`
    this.input.id = `post-comment-input-${this.post.id}`
    this.input.autocomplete = "off"
    this.input.maxLength = 300
    this.input.placeholder = lang.TYPE_HERE

    this.button = kel("button", "btn btn-post-send")
    this.button.id = `post-comment-button-${this.post.id}`
    this.button.innerHTML = '<i class="fa-solid fa-arrow-up"></i>'
    this.form.append(this.input, this.button)
  }
  private writeIfEmpty(commentlist: TCommentsF): void {
    const oldNomore: HTMLParagraphElement | null = this.el.querySelector(".nocomment")
    if (commentlist.length < 1) {
      if (oldNomore) return
      const nomore = kel("div", "nocomment", { e: lang.CHTS_NOCHAT })
      this.middle.prepend(nomore)
    } else {
      if (oldNomore) oldNomore.remove()
    }
  }
  private async getAllComments(): Promise<void> {
    this.isLocked = true
    const commentPreload = kel("div", "nocomment")
    commentPreload.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
    this.middle.append(commentPreload)
    const getComments = await xhr.get(`/x/posts/comments/${this.post.id}`)
    commentPreload.remove()
    if (!getComments || !getComments.ok) {
      await modal.alert(lang[getComments.msg] || lang.ERROR)
      this.isLocked = false
      return
    }
    this.isLocked = false
    this.list = getComments.data
    this.list.forEach((cmt) => this.renComment(cmt))
    this.writeIfEmpty(this.list)
  }
  private renComment(cmt: ICommentF): CommentBuilder {
    const comment = new CommentBuilder({ comment: cmt, parent: this, user: cmt.user })
    this.middle.prepend(comment.html)
    this.writeIfEmpty(this.list)
    return comment
  }
  private btnListener(): void {
    this.el.onclick = (e) => {
      const { target } = e
      if (target instanceof Node) {
        if (this.btnClose.contains(target) || !this.box.contains(target)) {
          this.destroy()
        }
      }
    }
    this.form.onsubmit = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const text = this.input.value.trim()
      this.input.value = ""
      const rawComment: ICommentF = {
        id: Date.now().toString(36),
        user: db.me,
        ts: Date.now(),
        text
      }
      this.list.push(rawComment)
      const newComment = this.renComment(rawComment)

      const addedComment = await xhr.post(`/x/posts/comment/add/${this.post.id}`, { text })
      this.list = this.list.filter((cmt) => cmt.id !== rawComment.id)
      if (!addedComment || !addedComment.ok) {
        newComment.remove()
        await modal.alert(lang[addedComment.msg] || lang.ERROR)
        this.writeIfEmpty(this.list)
        this.isLocked = false
        return
      }

      newComment.newId = addedComment.data.id
      this.list.push(addedComment.data)
      this.writeIfEmpty(this.list)

      this.postcard.addComments()
      this.isLocked = false
    }
  }
  get html(): HTMLDivElement {
    return this.el
  }
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    this.el.onclick = null
    if (!instant) await modal.waittime()
    this.el.remove()
  }
  run(): this {
    this.createElement()
    this.btnListener()
    this.getAllComments()
    return this
  }
}
