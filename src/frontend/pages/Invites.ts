import { eroot, kel } from "../helper/kel"
import { lang } from "../helper/lang"
import modal from "../helper/modal"
import setbadge from "../helper/setbadge"
import waittime from "../helper/waittime"
import xhr from "../helper/xhr"
import adap from "../main/adaptiveState"
import { removeParams } from "../main/urlHistory"
import userState from "../main/userState"
import db from "../manager/db"
import Chats from "../pm/center/Chats"
import Room from "../pm/content/Room"
import { IChatsF, IRoomDataF } from "../types/db.types"

export default class Invites {
  private link: string
  isLocked: boolean
  private el: HTMLDivElement
  private img: HTMLImageElement
  private gname: HTMLParagraphElement
  private gmembers: HTMLParagraphElement
  private btnJoin: HTMLDivElement
  private btnCancel: HTMLDivElement
  private id: string
  constructor(s: { link: string }) {
    this.link = s.link
    this.isLocked = false
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "invites")
    const box = kel("div", "box")
    const imgparent = kel("div", "img")
    this.img = new Image()
    this.img.alt = "Group"
    this.img.src = "/assets/group.jpg"
    imgparent.append(this.img)
    const title = kel("div", "title")
    this.gname = kel("p", "name")
    this.gname.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'
    this.gmembers = kel("p", "members")
    this.gmembers.innerHTML = lang.LOADING
    title.append(this.gname, this.gmembers)
    const actions = kel("div", "actions")
    this.btnCancel = kel("div", "btn btn-cancel")
    this.btnCancel.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`
    this.btnJoin = kel("div", "btn btn-join")
    this.btnJoin.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`
    actions.append(this.btnCancel, this.btnJoin)
    box.append(imgparent, title, actions)
    this.el.append(box)
    eroot().append(this.el)
  }
  async getGroup(): Promise<void> {
    const groupInvite = await xhr.get(`/invite/${this.link}`)
    this.isLocked = false
    if (!groupInvite || !groupInvite.ok) {
      this.id = "-2"
      this.gname.remove()
      this.gmembers.innerHTML = `<i>${lang.INV_NOT_FOUND_DESC}</i>`
      this.btnJoin.remove()
      this.btnCancel.innerHTML = lang.OK
      return
    }

    this.btnJoin.innerHTML = lang.GRPS_JOIN
    this.btnCancel.innerHTML = lang.CANCEL

    const group = groupInvite.data.group as IRoomDataF
    const members = groupInvite.data.members as number
    this.id = group.id

    this.gname.innerText = group.short
    if (group.badges) setbadge(this.gname, group.badges)
    this.gmembers.innerText = `${lang.INV_MEMBERS_LENGTH}: ${members}`
    this.img.alt = group.short

    if (group.image) {
      this.img.onerror = () => (this.img.src = "/assets/group.jpg")
      this.img.alt = group.short
      this.img.src = `/file/group/${group.image}`
    }
  }
  private btnListener(): void {
    this.btnCancel.onclick = () => {
      if (this.isLocked) return
      this.destroy()
    }
    this.btnJoin.onclick = async () => {
      if (this.isLocked) return
      await this.destroy()
      this.joinToGroup()
    }
    removeParams("invite")
  }
  private async joinToGroup(): Promise<void> {
    this.isLocked = true
    const joinGroup = await modal.loading(xhr.post(`/x/group/join/${this.id}`, { link: this.link }))
    if (!joinGroup || !joinGroup.ok) {
      await modal.alert(lang[joinGroup.msg] || lang.ERROR)
      this.isLocked = false
      return
    }

    const group: IChatsF = joinGroup.data
    if (db.c.find((ch) => ch.r.id === group.r.id)) return
    db.c.push(group)
    if (userState.center?.role === "chats") {
      const chatCenter = userState.center as Chats
      chatCenter.update({
        chat: group.m[group.m.length - 1] || [],
        users: group.u,
        roomdata: group.r
      })
    }
    this.isLocked = false
    adap.swipe(new Room({ data: group.r, users: group.u, chats: group }))
  }
  async destroy(): Promise<void> {
    this.isLocked = true
    this.el.classList.add("out")
    await waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): this {
    this.isLocked = true
    this.createElement()
    this.getGroup()
    this.btnListener()
    return this
  }
}
