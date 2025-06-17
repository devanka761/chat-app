import LangID from "../../public/locales/id.json"

export type LangType = "id" | "en"
export type LangObject = typeof LangID | { [key: string]: string }

export type SSKelement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]
