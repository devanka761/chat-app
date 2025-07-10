import { epm, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import xhr from "../../helper/xhr"
import adap from "../../main/adaptiveState"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"
import PostCard from "../parts/posts/PostCard"
import { IPostF, TPostsF } from "../../types/posts.types"
import CreatePost from "./CreatePost"
import db from "../../manager/db"

type PostFilter = "all" | "mine"

function SelectFilter(active: PostFilter) {
  return {
    ic: "filter-list",
    msg: lang.POST_FILTER,
    items: [
      { id: "all", label: lang.POST_FILT_1, activated: active === "all" },
      { id: "mine", label: lang.POST_FILT_2, activated: active === "mine" }
    ]
  }
}

export default class Posts implements PrimaryClass {
  king?: "center" | "content" | undefined
  role: string
  isLocked: boolean
  private btnBack: HTMLDivElement
  private wall: HTMLDivElement
  private el: HTMLDivElement
  private btnCreate: HTMLDivElement
  private actions: HTMLDivElement
  private preloading: HTMLDivElement
  private btnFilter: HTMLDivElement
  private currFilter: PostFilter
  private post_list?: TPostsF | null
  constructor() {
    this.king = "content"
    this.role = "posts"
    this.isLocked = false
    this.currFilter = "all"
  }
  private createElement(): void {
    this.el = kel("div", "Posts pmcontent")
    this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    const etitle = kel("div", "sect-title", { e: lang.APP_POSTS })
    this.btnFilter = kel("div", "btn btn-filter", { e: `<i class="fa-solid fa-filter-list fa-fw"></i>` })

    const top = kel("div", "top", { e: [this.btnBack, etitle, this.btnFilter] })

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)

    this.btnCreate = kel("div", "btn btn-create", { e: `<i class="fa-solid fa-plus"></i> ${lang.POSTS_CREATE}` })
    this.actions = kel("div", "actions")
    this.actions.append(this.btnCreate)
    this.wall.append(this.actions)
    const text = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
    this.preloading = kel("div", "post-wait", { e: text })
    this.wall.prepend(this.preloading)
  }
  private btnListener(): void {
    this.btnBack.onclick = () => adap.swipe()
    this.btnCreate.onclick = () => adap.swipe(new CreatePost({ posts: this, classBefore: this }))
    this.btnFilter.onclick = async () => {
      if (this.isLocked) return
      this.isLocked = true
      const filterChosen = (await modal.select(SelectFilter(this.currFilter))) as PostFilter | null
      if (!filterChosen) {
        this.isLocked = false
        return
      }

      if (filterChosen === this.currFilter) {
        this.isLocked = false
        return
      }

      this.isLocked = false
      this.currFilter = filterChosen
      if (!this.post_list) return
      const filteredPosts = this.currFilter === "mine" ? this.post_list.filter((post) => post.user.id === db.me.id) : this.post_list
      while (this.wall.firstChild) this.wall.firstChild.remove()
      filteredPosts.forEach((post) => this.renPost(post))
    }
  }
  private async getAllPosts(): Promise<void> {
    this.isLocked = true
    const getPosts = await xhr.get("/x/posts")
    this.preloading.remove()
    if (!getPosts || !getPosts.ok) {
      await modal.alert(lang[getPosts.msg] || lang.ERROR)
      this.isLocked = false
      return
    }

    const posts: TPostsF = getPosts.data
    this.post_list = posts
    posts.forEach((post) => this.renPost(post))
    this.writeIfEmpty(posts)
    await modal.waittime(500)
    this.isLocked = false
  }
  private renPost(post: IPostF): void {
    const userPost = new PostCard({ parent: this, post })
    this.wall.prepend(userPost.html)
  }
  private writeIfEmpty(pdb: TPostsF): void {
    const oldNomore: HTMLParagraphElement | null = this.el.querySelector(".nomore")
    if (pdb.length < 1) {
      if (oldNomore) return
      const nomore = kel("p", "nomore", { e: `${lang.CHTS_NOCHAT}<br/>${lang.POSTS_PLS}` })
      this.wall.prepend(nomore)
    } else {
      if (oldNomore) oldNomore.remove()
    }
  }
  update(): void {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    epm().append(this.el)
    this.btnListener()
    this.getAllPosts()
    // this.tempCard()
  }
}
