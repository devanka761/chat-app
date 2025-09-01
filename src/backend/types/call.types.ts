export type ICallType = 1 | 0

export enum CallType {
  Video = 1,
  Voice = 0
}

export type ICallUser = {
  id: string
  joined: boolean
}

export interface ICall {
  id: string
  type: ICallType | CallType
  owner: string
  startAt: number
  users: ICallUser[]
}
