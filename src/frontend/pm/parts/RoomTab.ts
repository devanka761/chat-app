import { kel } from "../../helper/kel"
import Room from "../content/Room"
import { IRoomDataF, IUserF } from "../../types/db.types"
import swiper from "../../manager/swiper"
import Profile from "../content/Profile"
import userState from "../../main/userState"
import Group from "../content/Group"

export default class RoomTab {
  readonly role: string
  public isLocked: boolean
  public room: Room
  private data: IRoomDataF
  private users: IUserF[]
  private top: HTMLDivElement
  private right: HTMLDivElement
  private left: HTMLDivElement
  private img: HTMLImageElement
  private displayName?: HTMLParagraphElement | null
  private userName: HTMLParagraphElement
  private userParent: HTMLDivElement
  private btnBack: HTMLDivElement
  private btnVoice?: HTMLDivElement
  private btnVideo?: HTMLDivElement
  private btnMore: HTMLDivElement
  constructor(s: { room: Room; data: IRoomDataF; users: IUserF[] }) {
    this.role = "roomform"
    this.isLocked = false
    this.room = s.room
    this.data = s.data
    this.users = s.users
  }
  private createLeft(): void {
    this.btnBack = kel("div", "btn btn-back", { e: '<i class="fa-solid fa-arrow-left"></i>' })
    const folder = this.data.type === "user" ? "user" : "group"
    this.img = new Image()
    this.img.onerror = () => (this.img.src = `/assets/${folder}.jpg`)
    this.img.alt = this.data.short
    this.img.src = this.data.image ? `/file/${folder}/${this.data.image}` : `/assets/${folder}.jpg`
    const imgParent = kel("div", "img", { e: this.img })

    this.userName = kel("p", "uname")
    const namesParent = kel("div", "names", { e: [this.userName] })
    if (this.data.type === "user") {
      this.displayName = kel("p", "dname")
      namesParent.append(this.displayName)
    }
    this.userParent = kel("div", "user", { e: [imgParent, namesParent] })

    this.left = kel("div", "left", { e: [this.btnBack, this.userParent] })
  }
  private createRight(): void {
    this.btnVideo = kel("div", "btn btn-video", { e: `<i class="fa-solid fa-video"></i>` })
    this.btnVoice = kel("div", "btn btn-call", { e: `<i class="fa-solid fa-phone"></i>` })
    this.btnMore = kel("div", "btn btn-more", { e: `<i class="fa-solid fa-ellipsis-vertical"></i>` })
    this.right = kel("div", "right", { e: [this.btnVideo, this.btnVoice, this.btnMore] })
  }
  private createElement(): void {
    this.createLeft()
    this.createRight()
    this.updateUser()
  }
  updateUser(newData?: IRoomDataF): void {
    if (newData) this.data = newData
    this.userName.innerText = this.data.short
    if (this.displayName) this.displayName.innerText = this.data.long

    if (this.data.image) {
      const folder = this.data.type === "user" ? "user" : "group"
      this.img = new Image()
      this.img.onerror = () => (this.img.src = `/assets/${folder}.jpg`)
      this.img.alt = this.data.short
      this.img.src = this.data.image ? `/file/${folder}/${this.data.image}` : `/assets/${folder}.jpg`
    }
  }
  private btnListener(): void {
    this.userListener()
  }
  private userListener(): void {
    this.userParent.onclick = () => {
      if (this.data.type === "user") {
        const user = this.users.find((usr) => usr.id === this.data.id)
        swiper(new Profile({ user: user as IUserF, room: this.room }), userState.content)
      } else {
        swiper(new Group({ group: this.data, users: this.users, room: this.room }), userState.content)
      }
    }
  }
  close(): void {
    this.top.removeChild(this.left)
    this.top.removeChild(this.right)
  }
  get html(): { left: HTMLDivElement; right: HTMLDivElement } {
    return { left: this.left, right: this.right }
  }
  run(top: HTMLDivElement): void {
    this.top = top
    this.createElement()
    this.top.append(this.left, this.right)
    this.btnListener()
  }
}
