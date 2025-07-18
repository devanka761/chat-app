import config from "../../backend/config/config"
import * as klang from "../helper/lang"
import modal from "../helper/modal"
import xhr from "../helper/xhr"
import Chats from "../pm/center/Chats"
import Account from "../pm/content/Account"
import { IAccountB } from "../../backend/types/account.types"
import { IRepB } from "../../backend/types/validate.types"
import HeaderBar from "../pm/parts/header/HeaderBar"
import { LangObject, Languages } from "../types/helper.types"
import { eroot, kel } from "../helper/kel"
import Empty from "../pm/content/Empty"
import socketClient from "../manager/socketClient"
import adap from "../main/adaptiveState"
import Tab from "../pm/parts/header/Tab"
import Invites from "./Invites"
import db from "../manager/db"

let lang: LangObject = {}

type LoginProvider = "USE_DISCORD_OAUTH" | "USE_GITHUB_OAUTH" | "USE_GOOGLE_OAUTH"

const ProviderObject = {
  USE_OAUTH_DISCORD: "discord",
  USE_OAUTH_GITHUB: "github",
  USE_OAUTH_GOOGLE: "google"
}

function loginProvider(provider: LoginProvider): HTMLElement {
  const btn = kel("div", "inp")
  btn.append(
    kel("a", `btn btn-${ProviderObject[provider]}`, {
      a: { href: `/x/auth/${ProviderObject[provider]}` },
      e: `<i class="fa-brands fa-${ProviderObject[provider]}"></i> ${ProviderObject[provider]} Login`
    })
  )

  return btn
}

function SelectLang(): object {
  return {
    ic: "language",
    msg: "Language",
    items: [
      { id: "id", label: "Bahasa Indonesia", activated: klang.klang.currLang === "id" },
      { id: "en", label: "English", activated: klang.klang.currLang === "en" }
    ]
  }
}
let auth_container: HTMLDivElement | null = null

export default class Auth {
  private el: HTMLDivElement
  private crateElement(): void {
    this.el = kel("div", "Auth")
    this.el.innerHTML = `<div class="none"><i class="fa-solid fa-map"></i> <i class="fa-regular fa-map"></i> <i class="fa-light fa-map"></i> <i class="fa-thin fa-map"></i> <i class="fa-duotone fa-solid fa-map"></i> <i class="fa-duotone fa-regular fa-map"></i> <i class="fa-duotone fa-light fa-map"></i> <i class="fa-duotone fa-thin fa-map"></i> <i class="fa-sharp fa-solid fa-map"></i> <i class="fa-brands fa-font-awesome"></i> <i class="fa-sharp fa-regular fa-map"></i> <i class="fa-sharp fa-light fa-map"></i> <i class="fa-sharp fa-thin fa-map"></i> <i class="fa-sharp-duotone fa-solid fa-map"></i> <i class="fa-sharp-duotone fa-regular fa-map"></i> <i class="fa-sharp-duotone fa-light fa-map"></i> <i class="fa-sharp-duotone fa-thin fa-map"></i></div>`
  }
  private async checkUser(): Promise<void> {
    await klang.klang.load()
    lang = klang.lang

    const isUser: IRepB = await modal.loading(xhr.get("/x/auth/isUser"))
    if (isUser.code !== 200) {
      this.el.querySelector(".none")?.remove()
      return this.writeForm()
    }
    this.initializeData(isUser.data ?? {})
    this.el.remove()
    auth_container?.remove()
    const epm: HTMLDivElement = kel("div", "pm")
    eroot().append(epm)
    adap.setHeader(new HeaderBar())
    const newcontent = isUser.data.isFirst ? new Account() : new Empty()
    adap.setCenter(new Chats())
    adap.setContent(newcontent)
    adap.setTab(new Tab())
    adap.launch()
    this.getInviteFrom()
  }
  private initializeData(s: IAccountB): void {
    socketClient.run(s)
  }
  private getInviteFrom(): void {
    const urlParams = new URLSearchParams(window.location.search)
    const inviteId = urlParams.get("invite")
    if (inviteId) {
      if (db.c.find((ch) => ch.r.link === inviteId)) return
      new Invites({ link: inviteId })
    }
  }
  private writeForm(): void {
    auth_container = this.el
    new SignEmail().run()
  }
  run(): void {
    this.crateElement()
    document.querySelector(".app")?.append(this.el)
    this.checkUser()
  }
}

class SignEmail {
  public email: string | null
  private isLocked: boolean
  private el: HTMLDivElement
  constructor({ email = null }: { email?: string | null } = {}) {
    this.email = email
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kel("div", "box")
    this.el.innerHTML = `
    <div class="top">
      <p>KIRIMIN</p>
    </div>
    <form action="/x/auth/sign-in" method="post" class="form" id="sign-in-form">
      <div class="field">
        <div class="btn btn-lang">
          <span>Language</span> <i class="fa-solid fa-chevron-down"></i>
        </div>
      </div>
      <div class="field">
        <div class="labels">
          <label for="email">${lang.AUTH_EMAIL}</label>
        </div>
        <div class="inp">
          <input type="text" name="email" id="email" autocomplete="email" placeholder="example@example.com" ${this.email ? 'value="' + this.email + '"' : ""} required/>
        </div>
      </div>
      <div class="field">
        <div class="inp">
          <button class="btn btn-login">${lang.AUTH_LOGIN}</button>
        </div>
      </div>
      <div class="field center">
        <div class="txt center">${lang.OR}</div>
      </div>
      <div class="field other-providers">
      </div>
      <div class="field center">
        <div class="txt center"><p>${lang.AUTH_NOTICE}</p></div>
      </div>
    </form>`
  }
  private formListener(): void {
    const eProviders: HTMLElement = this.el.querySelector(".other-providers") as HTMLElement
    Object.keys(config)
      .filter((k) => k.includes("USE_OAUTH") && config[k] === true)
      .forEach((k) => {
        eProviders.append(loginProvider(k as LoginProvider))
      })

    const form: HTMLFormElement = this.el.querySelector("#sign-in-form") as HTMLFormElement
    const btnLang: HTMLElement = this.el.querySelector(".btn-lang") as HTMLElement
    btnLang.onclick = async () => {
      if (this.isLocked) return
      this.isLocked = true
      const newLang: string | null = await modal.select(SelectLang())
      if (!newLang || newLang === klang.klang.currLang) {
        this.isLocked = false
        return
      }
      const formData = new FormData(form)
      formData.forEach((val, _) => (this.email = val.toString()))
      const definedLang = newLang as Languages
      klang.klang.currLang = definedLang
      klang.klang.save()
      await modal.loading(klang.klang.load())
      lang = klang.lang
      this.isLocked = false
      await this.destroy()
      new SignEmail({ email: this.email }).run()
    }
    form.onsubmit = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const data = {}
      const formData = new FormData(form)
      formData.forEach((val, k) => (data[k] = val.toString()))
      const userLogin: IRepB = await modal.loading(xhr.post("/x/auth/sign-in", data))
      if (!userLogin.ok) {
        await modal.alert(lang[userLogin.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      this.isLocked = false
      await this.destroy()
      new SignCode({ email: userLogin?.data?.email as string }).run()
    }
  }
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime(500, 5)
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    this.createElement()
    auth_container?.append(this.el)
    this.formListener()
  }
}

class SignCode {
  public email: string | null
  private isLocked: boolean
  private el: HTMLDivElement
  constructor(config: { email: string | null }) {
    this.email = config.email
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kel("div", "box")
    this.el.innerHTML = `
    <div class="top">
      <p>KIRIMIN</p>
    </div>
    <form action="/x/auth/verify" method="post" class="form" id="verify-form">
      <div class="field">
        <div class="btn btn-lang">
          <span>Language</span> <i class="fa-solid fa-chevron-down"></i>
        </div>
      </div>
      <div class="field">
        <div class="labels">
          <label for="email">${lang.AUTH_EMAIL}:</label>
        </div>
        <div class="inp">
          <input type="text" name="email" id="email" autocomplete="email" placeholder="example@example.com" ${this.email ? 'value="' + this.email + '"' : ""} readonly required />
        </div>
      </div>
      <div class="field">
        <div class="labels">
          <label for="code">${lang.AUTH_OTP_CODE}:</label>
        </div>
        <div class="inp">
          <input type="number" class="otp" name="code" id="code" autocomplete="off" placeholder="-------" required/>
        </div>
        <div class="sm">
          <i>${lang.AUTH_VERIFICATION_OTP}</i>
        </div>
      </div>
      <div class="field">
        <div class="inp">
          <button class="btn btn-login">${lang.AUTH_VERIFY}</button>
        </div>
      </div>
      <div class="field">
        <div class="txt center"><div class="btn btn-headback center">${lang.AUTH_HEADBACK_TXT}</div></div>
      </div>
    </form>`
  }
  private formListener(): void {
    const btnLang: HTMLElement = this.el.querySelector(".btn-lang") as HTMLElement
    btnLang.onclick = async () => {
      if (this.isLocked) return
      this.isLocked = true
      const newLang: string | null = await modal.select(SelectLang())
      if (!newLang || newLang === klang.klang.currLang) {
        this.isLocked = false
        return
      }
      const definedLang = newLang as Languages
      klang.klang.currLang = definedLang
      klang.klang.save()
      await modal.loading(klang.klang.load())
      lang = klang.lang
      this.isLocked = false
      await this.destroy()
      new SignCode({ email: this.email }).run()
    }
    const btnHeadback: HTMLElement = this.el.querySelector(".btn-headback") as HTMLElement
    btnHeadback.onclick = async () => {
      if (this.isLocked) return
      this.isLocked = true
      const confBack: boolean = await modal.confirm(lang.AUTH_HEADBACK)
      if (!confBack) {
        this.isLocked = false
        return
      }
      this.isLocked = false
      await this.destroy()
      new SignEmail({ email: this.email }).run()
    }
    const form: HTMLFormElement = this.el.querySelector("#verify-form") as HTMLFormElement
    form.onsubmit = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const data = {}
      const formData = new FormData(form)
      formData.forEach((val, k) => (data[k] = val))
      const userLogin: IRepB = await modal.loading(xhr.post("/x/auth/verify", data))
      if (!userLogin.ok) {
        await modal.alert(lang[userLogin.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      this.isLocked = false
      await this.destroy()
      auth_container?.remove()
      new Auth().run()
    }
  }
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime(500, 5)
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    this.createElement()
    auth_container?.append(this.el)
    this.formListener()
  }
}
