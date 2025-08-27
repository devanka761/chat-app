import modal from "../../helper/modal"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"
import { epm, kel, qutor } from "../../helper/kel"
import { klang, lang } from "../../helper/lang"
import { Languages } from "../../types/helper.types"
import adap from "../../main/adaptiveState"
import { changeColorTheme } from "../../manager/colortheme"
import waittime from "../../helper/waittime"

function SelectLang() {
  return {
    ic: "language",
    msg: "Language",
    items: [
      { id: "id", label: "Bahasa Indonesia", activated: klang.currLang === "id" },
      { id: "en", label: "English", activated: klang.currLang === "en" }
    ]
  }
}

function SelectColor() {
  return {
    ic: "palette",
    msg: lang.SET_CHOOSE_COLOR,
    items: [
      { id: "dark", label: lang.SET_COLOR_DARK, activated: userState.color === "dark" },
      { id: "light", label: lang.SET_COLOR_LIGHT, activated: userState.color === "light" }
    ]
  }
}
const notiflist: { id: string; label: string; actived?: boolean }[] = [
  { id: "a01", label: "SET_NEW_CHAT" },
  { id: "a02", label: "SET_FRIEND_REQ" },
  { id: "a03", label: "SET_VCALL" }
]
export default class Settings implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  private elang: HTMLParagraphElement | null
  private ecolor: HTMLParagraphElement | null
  private btnBack: HTMLDivElement
  classBefore?: PrimaryClass
  constructor() {
    this.king = "content"
    this.role = "settings"
    this.isLocked = false
  }
  createElement() {
    this.el = kel("div", "Account pmcontent")
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">${lang.APP_SETTINGS}</div>
    </div>
    <div class="wall">
      <div class="chp userlang">
        <div class="outer">
          <div class="chp-t">Language</div>
          <div class="chp-f"><p>Loading</p></div>
          <div class="chp-e btn-lang">Change Language <i class="fa-solid fa-chevron-down"></i></div>
        </div>
      </div>
      <div class="chp usercolor">
        <div class="outer">
          <div class="chp-t">${lang.SET_COLOR}</div>
          <div class="chp-f"><p>Loading</p></div>
          <div class="chp-e btn-color">${lang.SET_CHOOSE_COLOR} <i class="fa-solid fa-chevron-down"></i></div>
        </div>
      </div>
      <div class="chp usernotif">
        <div class="outer">
          <div class="chp-t">${lang.SET_IAP_NOTIF}</div>
          <div class="chp-f"></div>
        </div>
      </div>
      <div class="chp userpush">
        <div class="outer">
          <div class="chp-t">${lang.SET_WEB_PUSH}</div>
          <div class="chp-f"><p>${lang.SET_ALL_NOTIF}</p></div>
          <div class="chp-n">${lang.SET_CHANGE_RULE}</div>
        </div>
      </div>
    </div>`
    this.elang = qutor(".userlang .outer .chp-f p", this.el) as HTMLParagraphElement
    this.ecolor = qutor(".usercolor .outer .chp-f p", this.el) as HTMLParagraphElement
    this.btnBack = this.el.querySelector(".btn-back") as HTMLDivElement
  }
  renderLanguages(): void {
    if (this.elang) {
      this.elang.innerHTML = SelectLang().items.find((k) => k.activated)?.label || "English"
    }
  }
  renderColors(): void {
    if (this.ecolor) {
      this.ecolor.innerHTML = SelectColor().items.find((k) => k.activated)?.label || lang.SET_COLOR_DARK
    }
  }
  renderNotifications(): void {
    const enotif = this.el.querySelector(".usernotif .outer .chp-f")

    notiflist.forEach((nf) => {
      const ncard = document.createElement("label")
      ncard.setAttribute("for", nf.id)
      ncard.innerHTML = `<i>${lang[nf.label]}</i>`
      const inp = document.createElement("input")
      inp.type = "checkbox"
      inp.name = nf.id
      inp.id = nf.id
      if (userState.notif[nf.id]) inp.checked = true
      inp.onchange = () => {
        userState.notif[nf.id] = Number(inp.checked)
        userState.save()
      }
      ncard.append(inp)
      if (enotif) enotif.append(ncard)
    })
  }
  writeSettings(): void {
    this.renderLanguages()
    this.renderColors()
    this.renderNotifications()
  }
  btnListener() {
    this.btnBack.onclick = () => {
      if (this.isLocked) return
      adap.swipe(this.classBefore)
    }
    const btnLang = qutor(".btn-lang", this.el)
    if (btnLang)
      btnLang.onclick = async () => {
        if (this.isLocked) return
        this.isLocked = true

        const selLang = await modal.select(SelectLang())
        if (!selLang) {
          this.isLocked = false
          return
        }
        if (selLang === klang.currLang) {
          this.isLocked = false
          return
        }
        klang.currLang = selLang as Languages
        klang.save()
        document.documentElement.setAttribute("lang", selLang)
        document.documentElement.lang = selLang

        await modal.alert(lang.SET_CHOOSE_LANG_DONE)
        modal.loading(
          new Promise((resolve) => {
            setTimeout(resolve, 2000)
            setTimeout(() => window.location.reload(), 500)
          })
        )
        this.isLocked = false
      }
    const btnColor = qutor(".btn-color", this.el)
    if (btnColor)
      btnColor.onclick = async () => {
        if (this.isLocked) return
        this.isLocked = true

        const selColor = await modal.select(SelectColor())
        if (!selColor || selColor === userState.color) {
          this.isLocked = false
          return
        }
        userState.color = selColor === "light" ? "light" : "dark"
        userState.save()
        this.renderColors()
        await changeColorTheme(userState.color)
        this.isLocked = false
      }
    const btnWebpush = qutor(".btn-webpush", this.el)
    if (btnWebpush)
      btnWebpush.onclick = async () => {
        if (this.isLocked) return
        this.isLocked = true
        await modal.alert("This -ChangeWebPushRule- is currently under development")
        this.isLocked = false
      }
  }
  update(): void | Promise<void> {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    epm().append(this.el)
    this.writeSettings()
    this.btnListener()
  }
}
