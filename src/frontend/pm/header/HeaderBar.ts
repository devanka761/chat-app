import { eroot, kel, qutor } from "../../helper/kel"
import OptionHeaderBuilder from "./OptionHeaderBuilder"

export class HeaderBar {
  readonly role: string
  private isLocked: boolean
  private appname: string
  private el: HTMLDivElement
  private apptitle: HTMLDivElement
  private eactions: HTMLDivElement
  private btn_find: HTMLDivElement
  private btn_settings: HTMLDivElement
  private headerOptions?: HTMLDivElement | null
  constructor() {
    this.role = "header"
    this.appname = "KIRIMIN"
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kel("div", "header")
    const appParent = kel("div", "header-identification")
    this.apptitle = kel("div", "title", { e: "KIRIMIN" })
    this.eactions = kel("div", "actions")
    this.btn_find = kel("div", "btn btn-find", { e: `<i class="fa-solid fa-fw fa-magnifying-glass"></i>` })
    this.btn_settings = kel("div", "btn btn-settings", {
      e: `<i class="fa-solid fa-fw fa-ellipsis-vertical"></i>`
    })
    appParent.append(this.apptitle, this.eactions)
    this.el.append(appParent)
    this.eactions.append(this.btn_find, this.btn_settings)
  }
  private btnListener(): void {
    this.btn_find.onclick = async () => {
      const navFind = qutor(".nav-find")
      if (navFind) navFind.click()
    }
    this.btn_settings.onclick = () => {
      if (this.headerOptions) return
      this.headerOptions = new OptionHeaderBuilder({ header: this }).run().html
      this.el.append(this.headerOptions)
    }
  }
  closeOption(): void {
    if (this.headerOptions) {
      this.el.removeChild(this.headerOptions)
      this.headerOptions.remove()
      this.headerOptions = null
    }
  }
  set AppName(newtitle: string) {
    this.appname = newtitle
    this.apptitle.innerHTML = newtitle
  }
  get AppName(): string {
    return this.appname
  }
  run(): void {
    this.createElement()
    eroot().append(this.el)
    this.btnListener()
  }
}
export default new HeaderBar()
