import { PrimaryClass, UserLocked, UserNotif } from "../types/userState.types"
import appConfig from "../../config/public.config.json"
import HeaderBar from "../pm/parts/header/HeaderBar"
import Tab from "../pm/parts/header/Tab"
import VCall from "../pm/parts/media/VCall"
import Incoming from "../pm/parts/media/Incoming"

class UserState {
  public notif: UserNotif
  public color: "dark" | "light"
  private currheader: HeaderBar | null
  private currtab: Tab | null
  private currcenter: PrimaryClass | null
  private currcontent: PrimaryClass | null
  private currMedia: VCall | null
  private currIncoming: Incoming | null
  public locked: UserLocked
  private saveKey: string
  constructor() {
    this.color = "dark"
    this.notif = { a01: 1, a02: 1, a03: 1 }
    this.currtab = null
    this.currcenter = null
    this.currcontent = null
    this.currMedia = null
    this.saveKey = "Kirimin_Local"
  }
  set header(newheader: HeaderBar | null) {
    this.currheader = newheader
  }
  get header(): HeaderBar | null {
    return this.currheader
  }
  set tab(newtab: Tab | null) {
    this.currtab = newtab
  }
  get tab(): Tab | null {
    return this.currtab
  }
  set center(newcenter: PrimaryClass | null) {
    this.currcenter = newcenter
  }
  get center(): PrimaryClass | null {
    return this.currcenter
  }
  set content(newcontent: PrimaryClass | null) {
    this.currcontent = newcontent
  }
  get content(): PrimaryClass | null {
    return this.currcontent
  }
  set media(newmedia: VCall | null) {
    this.currMedia = newmedia
  }
  get media(): VCall | null {
    return this.currMedia
  }
  set incoming(newincoming: Incoming | null) {
    this.currIncoming = newincoming
  }
  get incoming(): Incoming | null {
    return this.currIncoming
  }
  save(): void {
    window.localStorage.setItem(
      this.saveKey,
      JSON.stringify({
        notif: this.notif,
        color: this.color,
        saveVersion: appConfig.SAVE_VERSION
      })
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  read(): any {
    if (!window.localStorage) return null
    const file = window.localStorage.getItem(this.saveKey)
    return file ? JSON.parse(file) : null
  }
  async load(): Promise<void> {
    const file = this.read()
    if (file) {
      if (!file.saveVersion || file.saveVersion !== appConfig.SAVE_VERSION) return
      if (file.color) this.color = file.color
      if (file.notif) this.notif = file.notif
    }
  }
}

export default new UserState()
