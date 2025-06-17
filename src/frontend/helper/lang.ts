import { LangObject, LangType } from "../../types/helper.types"
import { LocalesLang } from "../../interfaces/helper.interfaces"
import xhr from "./xhr"

export const lang: LangObject = {}

class KiriminLang {
  readonly filekey: string
  curlang: LangType
  constructor() {
    this.filekey = "kirimin_lang"
    this.curlang = "en"
  }
  save(): void {
    window.localStorage.setItem(this.filekey, JSON.stringify({ lang: this.curlang }))
  }
  read(): LocalesLang | null {
    if (!window.localStorage) return null
    const file = window.localStorage.getItem(this.filekey)
    return file ? JSON.parse(file) : null
  }
  async load(): Promise<void> {
    const file = this.read()
    this.curlang = file && file.lang === "en" ? "en" : "id"
    const newLang = await xhr.get(`/file/locales/${this.curlang}`)
    const res = newLang.data as LangObject
    Object.keys(res).forEach((k: string) => {
      lang[k as keyof LangObject] = res[k as keyof LangObject]
    })
  }
}

export const klang = new KiriminLang()
