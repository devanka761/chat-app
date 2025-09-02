import { IChatsF, MeDB, SocketDB } from "../../frontend/types/db.types"

export interface IAccountB {
  me?: MeDB
  c?: IChatsF[]
  socket?: SocketDB
  v?: number
  package?: string
  publicKey: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  peer?: any | null
}

export type IAccountProvider = "discord" | "google" | "github" | "kirimin"

export enum AccountProvider {
  Discord = "discord",
  Google = "google",
  GitHub = "github",
  Kirimin = "kirimin"
}

export interface IAccountData {
  id: string
  email: string
  provider: AccountProvider | IAccountProvider
}

export interface IAccount {
  id: string
  data: IAccountData[]
}

export interface IAccountTemp {
  id?: string
  data: Partial<IAccountData>
}

export interface IAccountCookie {
  id: string
  data: IAccountData
}
