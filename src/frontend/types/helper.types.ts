import LangID from "../../../public/locales/id.json"

export type Languages = "id" | "en"

export interface LocalesLang {
  lang: string
}
export type LangObject = typeof LangID | { [key: string]: string }

interface ModalObject {
  ic: string
  msg: string
}
export interface ModalAlert extends ModalObject {
  okx: string
  ok?: VoidFunction
}
export interface ModalConfirm extends ModalAlert {
  img?: string
  cancelx: string
  cancel?: VoidFunction
}
export interface ModalPrompt extends ModalConfirm {
  tarea?: boolean
  iregex?: RegExp
  max?: number
  min?: number
  pholder?: string
  val?: string
}

interface SelectionItem {
  id: string
  label: string
  activated?: boolean
}

export interface ModalSelect extends ModalConfirm {
  items: SelectionItem[]
}

export type SSKelement = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]

export interface KelementAttr {
  c?: string
  class?: string
  "."?: string
  id?: string
  "#"?: string
  a?: {
    [key: string]: string | number | boolean
  }
  attr?: {
    [key: string]: string | number | boolean
  }
  child?: SSKelement | string | (SSKelement | string)[]
  e?: SSKelement | string | (SSKelement | string)[]
}
