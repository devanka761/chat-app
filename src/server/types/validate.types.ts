export type ValidateObj = {
  [key: string]: "string" | "number" | "boolean"
}

export type ValidateArr = string[]

type PossibleValue = string | number | boolean

// type PossibleData = {
//   [key: string]: PossibleValue | PossibleData
// }

export type PayloadData = {
  [key: string]: PossibleValue | PossibleValue[] | PayloadData | PayloadData[]
}
// type TempData = {
//   [key: string]: string | number | boolean | null | TempData;
// };
// export interface IRepBackData {
//   [key: string]: string | number | boolean | (string | number | boolean)[] | { [key: string]: string | number | boolean | (string | number | boolean)[] | { [key: string]: string | number | boolean | (string | number | boolean)[] } }
// }
export interface IRepBackData {
  [key: string]: string | number | boolean | IRepBackData | string[] | number[] | boolean[] | IRepBackData[] | (string | number | boolean | IRepBackData)[]
}
export interface IRepBack {
  ok: boolean
  code: number
  msg?: string
  data?: IRepBackData
}
export interface IRepBackRec {
  ok?: boolean
  code: number
  msg?: string
  data?: IRepBackData
}
export interface Zender {
  key: string
  from: string
  type: string
  [key: string]: string | number | boolean
}
