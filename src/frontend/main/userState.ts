import { PrimaryClass, UserLocked, UserNotif } from "../types/userState.types"

class UserState {
  private notif: UserNotif
  private color: "dark" | "light"
  public currtab: PrimaryClass | null
  public currcenter: PrimaryClass | null
  public currcontent: PrimaryClass | null
  public currlast: PrimaryClass | null
  public locked: UserLocked
  constructor() {
    this.color = "dark"
    this.notif = { a01: 1, a02: 1, a03: 1 }
    this.currtab = null
    this.currcenter = null
    this.currcontent = null
    this.currlast = null
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
}

export default new UserState()
