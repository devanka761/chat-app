import { epm, kel, qutor } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import adap from "../../main/adaptiveState"
import userState from "../../main/userState"
import ________ from "../../pages/about.json"
import { PrimaryClass } from "../../types/userState.types"
import packageVersion from "../../../config/version.json"
import db from "../../manager/db"

const updateUrl = "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2RldmFua2E3NjEvY2hhdC1hcHAvcmVmcy9oZWFkcy9tYWluL3NyYy9mcm9udGVuZC9wYWdlcy9hYm91dC5qc29u"

export default class About implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  private btnBack: HTMLDivElement
  private wall: HTMLDivElement
  private about: typeof ________
  private isDone: boolean = false
  constructor() {
    this.king = "content"
    this.role = "about"
    this.isLocked = false
    this.about = ________
  }
  createElement(): void {
    this.el = kel("div", "Account pmcontent")
    this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    const etitle = kel("div", "sect-title", { e: lang.APP_ABOUT })
    const top = kel("div", "top", { e: [this.btnBack, etitle] })

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)
  }
  private renImage(): void {
    let chp = qutor(".chp.userphoto", this.wall)
    if (!chp) {
      chp = kel("div", "chp userphoto")
      this.wall.append(chp)
    }
    let outer = qutor(".outer-img", chp)
    if (!outer) {
      outer = kel("div", "outer-img", { e: "<i></i>" })
      chp.append(outer)
    }

    if (outer.firstChild) outer.firstChild.remove()
    const img = new Image()
    img.src = "/assets/kirimin_icon.png"
    img.alt = this.about.name
    outer.append(img)
  }
  private renAppName(): void {
    let chp = qutor(".chp.name", this.wall)
    if (!chp) {
      chp = kel("div", "chp name")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Name" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    chpValue.innerHTML = this.isDone ? this.about.name : `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
  }
  private renAppPackageVersion(): void {
    let chp = qutor(".chp.package", this.wall)
    if (!chp) {
      chp = kel("div", "chp package")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Version" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    chpValue.innerHTML = this.isDone ? packageVersion.version : `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
  }
  private renAppBuildVersion(): void {
    let chp = qutor(".chp.build", this.wall)
    if (!chp) {
      chp = kel("div", "chp build")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Build Number" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    chpValue.innerHTML = this.isDone ? db.version.toString() : `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
  }
  private renSupport(): void {
    let chp = qutor(".chp.support", this.wall)
    if (!chp) {
      chp = kel("div", "chp support")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Contact Support" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    chpValue.innerHTML = this.isDone ? `<a href="mailto:${this.about.developer.email}" target="_blank">${this.about.developer.email}</a>` : `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
  }
  private renDeveloper(): void {
    let chp = qutor(".chp.developer", this.wall)
    if (!chp) {
      chp = kel("div", "chp developer")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Developer" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    chpValue.innerHTML = this.isDone ? `<a href="${this.about.developer.website}" target="_blank">${this.about.developer.user}</a>` : `<i class="fa-solid fa-circle-notch fa-spin"></i> ${lang.LOADING}`
  }
  private async updateData(): Promise<void> {
    this.isLocked = true
    const _______: typeof ________ = await fetch(atob(updateUrl))
      .then((res) => res.json())
      .then((res) => res)
      .catch(() => ________)

    this.isDone = true
    this.about = _______
    this.writeData()
  }
  private writeData(): void {
    this.renImage()
    this.renAppName()
    this.renAppPackageVersion()
    this.renAppBuildVersion()
    this.renSupport()
    this.renDeveloper()
    this.isLocked = false
  }
  btnListener(): void {
    this.btnBack.onclick = () => {
      if (this.isLocked) return
      adap.swipe()
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
    this.writeData()
    this.updateData()
    this.btnListener()
  }
}
