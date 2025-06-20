import { PrimaryClass, UserLocked, UserNotif } from "../types/userState.types"
import appConfig from "../../backend/config/public.config.json"

class UserState {
  public notif: UserNotif
  public color: "dark" | "light"
  public currtab: PrimaryClass | null
  public currcenter: PrimaryClass | null
  public currcontent: PrimaryClass | null
  public currlast: PrimaryClass | null
  public locked: UserLocked
  private saveKey: string
  constructor() {
    this.color = "dark"
    this.notif = { a01: 1, a02: 1, a03: 1 }
    this.currtab = null
    this.currcenter = null
    this.currcontent = null
    this.currlast = null
    this.saveKey = "Kirimin_Local"
    this.locked = { currtab: false, currcenter: false, currcontent: false }
  }
  set tab(newtab: PrimaryClass | null) {
    this.currlast = newtab
    this.currtab = newtab
  }
  get tab(): PrimaryClass | null {
    return this.currtab
  }
  set center(newcenter: PrimaryClass | null) {
    this.currlast = newcenter
    this.currcenter = newcenter
  }
  get center(): PrimaryClass | null {
    return this.currcenter
  }
  set content(newcontent: PrimaryClass | null) {
    this.currlast = newcontent
    this.currcontent = newcontent
  }
  get content(): PrimaryClass | null {
    return this.currcontent
  }
  set last(newlast: PrimaryClass | null) {
    this.currlast = newlast
    this.currlast = newlast
  }
  get last(): PrimaryClass | null {
    return this.currlast
  }

  save(): void {
    window.localStorage.setItem(
      this.saveKey,
      JSON.stringify({
        notif: this.notif,
        color: this.color,
        saveVersion: appConfig.saveVersion
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
      if (!file.saveVersion || file.saveVersion !== appConfig.saveVersion) return
      if (file.color) this.color = file.color
      if (file.notif) this.notif = file.notif
    }
  }
}

export default new UserState()
