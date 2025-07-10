import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import Posts from "../../content/Posts"
import PostCard from "./PostCard"

export default class Comments {
  isLocked: boolean
  posts: Posts
  postcard: PostCard
  private el: HTMLDivElement
  private btnClose: HTMLDivElement
  private form: HTMLFormElement
  private box: HTMLDivElement
  constructor(s: { posts: Posts; postcard: PostCard }) {
    this.isLocked = false
    this.posts = s.posts
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "comments")
    this.box = kel("div", "box")
    this.el.append(this.box)
    const top = kel("div", "comments-top")
    const bottom = kel("div", "comments-bottom")
    const middle = kel("div", "comments-mid")
    this.box.append(top, middle, bottom)
    const title = kel("div", "title", { e: lang.POST_COMMENT_TITLE })
    this.btnClose = kel("div", "btn btn-close")
    this.btnClose.innerHTML = '<i class="fa-duotone fa-circle-minus"></i>'
    top.append(title, this.btnClose)

    bottom.innerHTML = `
    <form class="form" id="post-comment-form" action="/post/comment/add" method="post">
      <input type="text" name="post-comment-text" id="post-comment-text" autocomplete="off" class="input" maxlength="300" placeholder="Type Here" />
      <button class="btn btn-post-send" id="post-comment-send"><i class="fa-solid fa-arrow-up"></i></button>
    </form>`

    middle.innerHTML = `
    <div class="card me">
      <div class="photo">
        <img src="/assets/user.jpg" alt="test" />
      </div>
      <div class="data">
        <div class="data-user">
          <span class="username">username</span><span class="timestamp">now</span>
        </div>
        <div class="data-text">
          <p>lorem ipsum dolor sit amet</p>
        </div>
      </div>
      <div class="cmt-actions">
        <div class="btn btn-delcomment"><i class="fa-solid fa-trash-can fa-fw"></i></div>
      </div>
    </div>
    <div class="nocomment">${lang.CHTS_NOCHAT}</div>`
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
    return this
  }
}
