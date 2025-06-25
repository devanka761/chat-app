import { kel } from "../helper/kel"
import setbadge from "../helper/setbadge"
import userState from "../main/userState"
import swiper from "../manager/swiper"
import Profile from "../pm/content/Profile"
import { IUserF } from "../types/db.types"

export default class FriendBuilder {
  private el: HTMLDivElement
  public user: IUserF

  private img: HTMLImageElement
  private userName: HTMLDivElement
  private displayName: HTMLDivElement
  constructor({ user }: { user: IUserF }) {
    this.user = user
  }
  private createElement(): void {
    this.el = kel("div", "card", { id: `friendlist-${this.user.id}` })

    this.img = new Image()
    this.img.alt = this.user.username
    this.img.onerror = () => (this.img.src = `/assets/user.jpg`)
    this.img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    this.img.width = 50

    const ecimg = kel("div", "img")
    ecimg.append(this.img)

    this.userName = kel("div", "name")
    this.userName.innerText = this.user.username

    if (this.user.badges) {
      setbadge(this.userName, this.user.badges)
    }

    this.displayName = kel("div", "last")
    this.displayName.innerText = this.user.displayname

    const edetail = kel("div", "detail")
    edetail.append(this.userName, this.displayName)

    const eleft = kel("div", "left")
    eleft.append(ecimg, edetail)

    this.el.append(eleft)
  }
  private clickListener(): void {
    this.el.onclick = () => {
      if (userState.currcontent?.role === "profile") {
        if (userState.currcontent.isLocked) return
        const profile = userState.currcontent as Profile
        if (profile.user.id === this.user.id) return
      }
      swiper(new Profile({ user: this.user, card: this }), userState.currcontent)
    }
  }
  private init(): void {
    this.createElement()
    this.clickListener()
  }
  hide(): void {
    this.el.classList.add("hidden")
  }
  show(): void {
    this.el.classList.remove("hidden")
  }
  get id(): string {
    return this.user.id
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.init()
    return this
  }
}
