import { LangObject, Languages, LocalesLang } from "../types/helper.types"
import xhr from "./xhr"

export const lang: LangObject = {}

class KiriminLangs {
  readonly fileKey: string
  public currLang: Languages
  constructor() {
    this.fileKey = "kirimin_lang"
    this.currLang = "en"
  }
  save(): void {
    window.localStorage.setItem(this.fileKey, JSON.stringify({ lang: this.currLang }))
  }
  read(): LocalesLang | null {
    if (!window.localStorage) return null
    const file = window.localStorage.getItem(this.fileKey)
    return file ? JSON.parse(file) : null
  }
  async load(): Promise<void> {
    const file = this.read()
    this.currLang = file && file.lang === "en" ? "en" : "id"
    const newLang = await xhr.get(`/locales/${this.currLang}.json`)
    Object.keys(newLang).forEach(k => (lang[k] = newLang[k]))
  }
}

export const klang = new KiriminLangs()
