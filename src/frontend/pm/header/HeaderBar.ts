import { eroot, kel } from "../../helper/kel"

class HeaderBar {
  readonly role: string
  private isLocked: boolean
  private appname: string
  private el: HTMLDivElement
  private apptitle: HTMLDivElement
  private eactions: HTMLDivElement
  private btn_find: HTMLDivElement
  private btn_settings: HTMLDivElement
  constructor() {
    this.role = "header"
    this.appname = "KIRIMIN"
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kel("div", "header")
    this.apptitle = kel("div", "title", { e: "KIRIMIN" })
    this.eactions = kel("div", "actions")
    this.btn_find = kel("div", "btn btn-find", { e: `<i class="fa-solid fa-fw fa-magnifying-glass"></i>` })
    this.btn_settings = kel("div", "btn btn-settings", {
      e: `<i class="fa-solid fa-fw fa-ellipsis-vertical"></i>`
    })
    this.el.append(this.apptitle, this.eactions)
    this.eactions.append(this.btn_find, this.btn_settings)
  }
  private btnListener(): void {
    this.btn_find.onclick = async () => {
      const navFind = <HTMLElement>document.querySelector(".nav-find")
      if (navFind) navFind.click()
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
