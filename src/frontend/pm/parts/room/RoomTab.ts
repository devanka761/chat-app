import { kel } from "../../../helper/kel"
import Room from "../../content/Room"
import { IRoomDataF, IUserF } from "../../../types/db.types"
import Profile from "../../content/Profile"
import Group from "../../content/Group"
import FriendBuilder from "../../props/friends/FriendBuilder"
import adap from "../../../main/adaptiveState"
import { PrimaryClass } from "../../../types/userState.types"
import userState from "../../../main/userState"
import modal from "../../../helper/modal"
import { lang } from "../../../helper/lang"
import VCall from "../media/VCall"
import OptionRoomTabBuilder from "./OptionRoomTabBuilder"
import setbadge from "../../../helper/setbadge"
import { KirAIRoom } from "../../../helper/AccountKirAI"

export default class RoomTab {
  readonly role: string
  public isLocked: boolean
  public room: Room
  private data: IRoomDataF
  users: IUserF[]
  private top: HTMLDivElement
  private right: HTMLDivElement
  private left: HTMLDivElement
  private displayName?: HTMLParagraphElement | null
  private userName: HTMLParagraphElement
  private userParent: HTMLDivElement
  private btnBack: HTMLDivElement
  private btnVoice?: HTMLDivElement
  private btnVideo?: HTMLDivElement
  private btnMore: HTMLDivElement
  private card?: FriendBuilder
  classBefore?: PrimaryClass
  private options?: OptionRoomTabBuilder | null
  constructor(s: { room: Room; data: IRoomDataF; users: IUserF[]; card?: FriendBuilder; classBefore?: PrimaryClass }) {
    this.role = "roomform"
    this.isLocked = false
    this.room = s.room
    this.data = s.data
    this.users = s.users
    this.card = s.card
    this.classBefore = s.classBefore
  }
  private createLeft(): void {
    this.btnBack = kel("div", "btn btn-back", { e: '<i class="fa-solid fa-arrow-left"></i>' })
    const folder = this.data.type === "user" ? "user" : "group"
    const img = new Image()
    img.onerror = () => {
      console.log("image error")
      img.src = `/assets/${folder}.jpg`
    }
    img.alt = this.data.short
    img.src = this.data.image ? `/file/${folder}/${this.data.image}` : `/assets/${folder}.jpg`
    const imgParent = kel("div", "img", { e: img })

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
    this.btnVideo = kel("div", "btn btn-video", { e: `<i class="fa-solid fa-video fa-fw"></i>` })
    this.btnVoice = kel("div", "btn btn-call", { e: `<i class="fa-solid fa-phone fa-fw"></i>` })
    this.btnMore = kel("div", "btn btn-more", { e: `<i class="fa-solid fa-ellipsis-vertical fa-fw"></i>` })
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

    if (this.data.badges) {
      setbadge(this.userName, this.data.badges)
    }

    if (this.displayName) this.displayName.innerText = this.data.long

    if (this.data.image) {
      const folder = this.data.type === "user" ? "user" : "group"
      const img = new Image()
      img.onerror = () => (img.src = `/assets/${folder}.jpg`)
      img.alt = this.data.short
      img.src = this.data.image ? `/file/${folder}/${this.data.image}` : `/assets/${folder}.jpg`
    }
  }
  private btnListener(): void {
    this.btnBack.onclick = () => {
      if (this.isLocked || this.room.isLocked) return
      adap.swipe(this.classBefore)
    }

    this.btnMore.onclick = () => {
      if (this.options) return
      this.options = new OptionRoomTabBuilder({ tab: this, top: this.top })
    }

    this.btnCallListener()
    this.userListener()
  }
  closeOptions(): void {
    if (this.options) this.options = null
  }
  private btnCallListener(): void {
    if (this.btnVoice)
      this.btnVoice.onclick = async () => {
        if (this.isLocked) return
        if (this.data.type !== "user" || this.data.id === KirAIRoom.id) {
          await modal.alert(lang.CALL_NOT_USER)
          this.isLocked = false
          return
        }
        this.isLocked = true
        const onMedia = userState.media || userState.incoming
        const user = this.users.find((usr) => usr.id === this.data.id)
        if (!user) {
          await modal.alert(lang.FIND_NOTFOUND)
          this.isLocked = false
          return
        }
        if (onMedia) {
          await modal.alert(lang.CALL_INCALL)
          this.isLocked = false
          return
        }
        if (user.isFriend !== 1) {
          await modal.alert(lang.PROF_ALR_NOFRIEND_1)
          this.isLocked = false
          return
        }
        this.isLocked = false
        const voiceCall = new VCall({ user: user })
        voiceCall.call()
      }
    if (this.btnVideo)
      this.btnVideo.onclick = async () => {
        if (this.isLocked) return
        if (this.data.type !== "user" || this.data.id === KirAIRoom.id) {
          await modal.alert(lang.CALL_NOT_USER)
          this.isLocked = false
          return
        }
        this.isLocked = true
        const onMedia = userState.media || userState.incoming
        const user = this.users.find((usr) => usr.id === this.data.id)
        if (!user) {
          await modal.alert(lang.FIND_NOTFOUND)
          this.isLocked = false
          return
        }
        if (onMedia) {
          await modal.alert(lang.CALL_INCALL)
          this.isLocked = false
          return
        }
        if (user.isFriend !== 1) {
          await modal.alert(lang.PROF_ALR_NOFRIEND_1)
          this.isLocked = false
          return
        }
        this.isLocked = false
        const videoCall = new VCall({ user: user, video: true })
        videoCall.call()
      }
  }
  private userListener(): void {
    this.userParent.onclick = () => {
      if (this.data.id === KirAIRoom.id) {
        return
      } else if (this.data.type === "user") {
        const user = this.users.find((usr) => usr.id === this.data.id)
        const classBefore = this.room.classBefore?.role === "profile" ? this.room.classBefore.classBefore : this.room
        adap.swipe(new Profile({ user: user as IUserF, room: this.room, card: this.card, classBefore }))
      } else {
        const classBefore = this.room.classBefore?.role === "group" ? this.room.classBefore.classBefore : this.room
        adap.swipe(new Group({ group: this.data, users: this.users, room: this.room, classBefore }))
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
