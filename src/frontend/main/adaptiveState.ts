import swiper from "../manager/swiper"
import Empty from "../pm/content/Empty"
import HeaderBar from "../pm/header/HeaderBar"
import Tab from "../pm/header/Tab"
import { PrimaryClass } from "../types/userState.types"
import userState from "./userState"

class AdaptiveState {
  private isNarrow: boolean
  private lastheader: HeaderBar
  private lasttab: Tab
  private lastcenter: PrimaryClass
  private lastcontent: PrimaryClass
  constructor() {
    this.isNarrow = false
  }
  setHeader(newheader: HeaderBar): HeaderBar {
    this.lastheader = newheader
    return newheader
  }
  setTab(newtab: Tab): Tab {
    this.lasttab = newtab
    return newtab
  }
  setCenter(newcenter: PrimaryClass): PrimaryClass {
    this.lastcenter = newcenter
    return newcenter
  }
  setContent(newcontent: PrimaryClass): PrimaryClass {
    this.lastcontent = newcontent
    return newcontent
  }
  private manageSize(): void {
    if (window.innerWidth <= 850) {
      if (this.isNarrow) return
      this.isNarrow = true
    } else {
      if (!this.isNarrow) return
      this.isNarrow = false
    }
    if (this.isNarrow) {
      if (!userState.content || userState.content.role === "empty") {
        if (userState.content) {
          userState.content.destroy(true)
          userState.content = null
        }
        if (!userState.center) this.lastcenter.run()
        if (!userState.header) this.lastheader.run()
        if (!userState.tab) this.lasttab.run()
      } else {
        if (userState.tab) {
          userState.tab.destroy(true)
          userState.tab = null
        }
        if (userState.header) {
          userState.header.destroy(true)
          userState.header = null
        }
        if (userState.center) {
          userState.center.destroy(true)
          userState.center = null
        }
      }
    } else {
      if (!userState.center) this.lastcenter.run()
      if (!userState.content) new Empty().run()
      if (!userState.header) this.lastheader.run()
      if (!userState.tab) this.lasttab.run()
    }
  }
  swipe(newer: PrimaryClass = new Empty()): void {
    if (this.isNarrow) {
      if (newer.role === "empty") {
        userState.tab = this.lasttab
        userState.header = this.lastheader
        const newers = [this.lastcenter, userState.tab, userState.header]
        const olders = [this.lastcontent]
        swiper(newers, olders)
        userState.tab.enable(this.lastcenter.role)
      } else if (newer.king === "content") {
        const currentOlder = (userState.center || userState.content) as PrimaryClass
        const olders: PrimaryClass[] = []
        const newers: PrimaryClass[] = [newer]
        if (currentOlder.king === "center") {
          olders.push(this.lastheader, this.lasttab, currentOlder)
        } else {
          olders.push(currentOlder)
        }
        swiper(newers, olders)
      } else if (newer.king === "center") {
        const currentOlder = (userState.center || userState.content) as PrimaryClass
        const olders: PrimaryClass[] = [currentOlder]
        const newers: PrimaryClass[] = [newer]

        if (currentOlder.king === "content") {
          newers.push(this.lastheader, this.lasttab)
        }

        swiper(newers, olders)
      }
    } else {
      const older = (newer.king === "content" ? userState.content : userState.center) as PrimaryClass
      swiper([newer], [older])
    }

    if (newer.king === "center") this.lastcenter = newer
    if (newer.king === "content") this.lastcontent = newer
  }
  private init(): void {
    if (this.isNarrow) {
      if (this.lastcontent.role === "empty") {
        this.lastheader.run()
        this.lastcenter.run()
        this.lasttab.run()
      } else {
        this.lastcontent.run()
      }
    } else {
      this.lastheader.run()
      this.lastcenter.run()
      this.lastcontent.run()
      this.lasttab.run()
    }
  }
  launch() {
    if (window.innerWidth <= 850) this.isNarrow = true
    this.init()
    window.addEventListener("resize", () => {
      this.manageSize()
    })
  }
}
const adap = new AdaptiveState()
export default adap
