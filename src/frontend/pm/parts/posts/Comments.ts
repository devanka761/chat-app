import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import xhr from "../../../helper/xhr"
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
  constructor(s: { posts: Posts; postcard: PostCard; post: IPostF }) {
    this.isLocked = false
    this.posts = s.posts
    this.post = s.post
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

    bottom.innerHTML = `
    <form class="form" id="post-comment-form" action="/post/comment/add" method="post">
      <input type="text" name="post-comment-text" id="post-comment-text" autocomplete="off" class="input" maxlength="300" placeholder="Type Here" />
      <button class="btn btn-post-send" id="post-comment-send"><i class="fa-solid fa-arrow-up"></i></button>
    </form>`
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
    const getComments = await xhr.get(`/x/posts/comments/${this.post.id}`)
    if (!getComments || !getComments.ok) {
      await modal.alert(lang[getComments.msg] || lang.ERROR)
      this.isLocked = false
      return
    }
    this.isLocked = false
    const commentlist: TCommentsF = getComments.data
    commentlist.forEach((cmt) => this.renComment(cmt))
    this.writeIfEmpty(commentlist)
  }
  private renComment(cmt: ICommentF): void {
    const comment = new CommentBuilder({ comment: cmt, parent: this, user: cmt.user })
    this.middle.prepend(comment.html)
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
