/* eslint-disable @typescript-eslint/no-explicit-any */
export type ValidProviders = "kirimin" | "discord" | "github" | "google"

export interface IUserTempB {
  id?: string | number
  email?: string
  provider?: ValidProviders
}

export interface IUserSessionB extends IUserTempB {
  id: string | number
  email: string
  provider: ValidProviders
}

export interface IUserCookieB {
  id: string
  data: IUserSessionB
}

export interface KiriminObject {
  id: string
  data?: any
}
