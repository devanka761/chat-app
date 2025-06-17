/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IPayLoadB {
  [key: string]: string | number | boolean | null
}

export interface IRepTempB {
  ok?: boolean
  code: number
  msg?: string
  data?: any
}
export interface IRepB extends IRepTempB {
  ok: boolean
}
export interface Zender {
  key: string
  from: string
  type: string
  [key: string]: string | number | boolean
}
export interface XHRData {
  [key: string]: string | number | boolean | null
}
