export type ValidProviders = "kirimin" | "discord" | "github" | "google"

export interface TempUserData {
  id?: string | number
  email?: string
  provider?: ValidProviders
}

export interface SessionUserData extends TempUserData {
  id: string | number
  email: string
  provider: ValidProviders
}

export type TempUserDatum = [TempUserData, ...TempUserData[]]

export type SessionUserDatum = [SessionUserData, ...SessionUserData[]]

export interface KiriminObject {
  id: string
  data?: object | null | undefined
}

export type UserUID = string

export type PossibleData = {
  [key: string]: string | number | boolean
}
