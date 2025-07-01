import { epm, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import adap from "../../main/adaptiveState"
import db from "../../manager/db"
import { IRoomDataF, IUserF } from "../../types/db.types"
import Group from "../content/Group"
import Profile from "../content/Profile"

export default class Member {
  public isLocked: boolean
  private group: IRoomDataF
  private user: IUserF
  private el: HTMLLIElement
  private img: HTMLImageElement
  private username: HTMLElement
  private btnKick?: HTMLElement | null
  private left: HTMLSpanElement
  private right?: HTMLSpanElement | null
  private parent: Group
  constructor(s: { group: IRoomDataF; user: IUserF; parent: Group }) {
    this.isLocked = false
    this.group = s.group
    this.user = s.user
    this.parent = s.parent
    this.run()
  }
  createElement(): void {
    this.left = kel("span", "left")
    if (this.group.owner === db.me.id && this.user.id !== db.me.id) {
      this.right = kel("div", "btn btn-kick", { e: `<i class="fa-solid fa-circle-x fa-fw"></i>` })
    }
    this.el = kel("li")
    this.el.prepend(this.left)
    if (this.right) this.el.append(this.right)
  }
  setImg(src?: string): void {
    if (src) this.user.image = src
    if (!this.left.contains(this.img)) {
      this.img = new Image()
      this.left.append(this.img)
    }

    this.img.onerror = () => (this.img.src = "/assets/user.jpg")
    this.img.alt = this.user.username
    this.img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
  }
  setUname(uname?: string): void {
    if (uname) this.user.username = uname
    if (!this.left.contains(this.username)) {
      this.username = kel("span", "uname")
      this.left.append(this.username)
    }
    this.username.innerText = this.user.username
    if (this.user.badges) setbadge(this.username, this.user.badges)
    if (this.group.owner === this.user.id) {
      const crown = kel("i", "fa-light fa-user-crown")
      crown.title = "Group Owner"
      this.username.append(crown)
    }
  }
  private writeUser(): void {
    this.setImg()
    this.setUname()
  }
  private btnListener(): void {
    this.profileListener()
    this.kickListener()
  }
  private profileListener(): void {
    this.left.onclick = () => {
      if (this.user.id === db.me.id) return
      adap.swipe(new Profile({ user: this.user, classBefore: this.parent }))
    }
  }
  private kickListener(): void {
    if (this.right && db.me.id === this.group.owner && this.user.id !== db.me.id)
      this.right.onclick = async () => {
        if (this.isLocked) return
        this.isLocked = true
        const kickMessage = lang.GRPS_KICK_CONFIRM.replace("{uname}", this.user.username)
        const confKick = await modal.confirm(kickMessage)
        if (!confKick) {
          this.isLocked = false
          return
        }
        const kickedMember = await modal.loading(xhr.post(`/x/group/kick/${this.group.id}/${this.user.id}`))
        if (!kickedMember || !kickedMember.ok) {
          await modal.alert(lang[kickedMember.msg] || lang.ERROR)
          this.isLocked = false
          return
        }
        this.remove()
      }
  }
  remove(): void {
    this.parent.users = this.parent.users.filter((usr) => usr.id !== this.user.id)
    const group = db.c.find((ch) => ch.r.id === this.parent.group.id)
    if (group) {
      group.u = group.u.filter((usr) => usr.id !== this.user.id)
    }
    this.el.remove()
  }
  get html(): HTMLLIElement {
    return this.el
  }
  get isOwner(): boolean {
    return this.group.owner === this.user.id
  }
  init(): void {
    if (this.user.id === db.me.id) this.user = db.me
    this.createElement()
    epm().append(this.el)
    this.writeUser()
    this.btnListener()
  }
  run(): this {
    this.init()
    return this
  }
}
