/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidProviders } from "../types/binder.types"

export interface IAuthUserB {
  id?: string | number
  email?: string
  provider?: ValidProviders
}
export interface ISessionUserB extends IAuthUserB {
  id: string | number
  email: string
  provider: ValidProviders
}
export interface ICookieUserB {
  id: string
  data: ISessionUserB
}
export interface IMondinObject {
  id: string
  data?: any
}
