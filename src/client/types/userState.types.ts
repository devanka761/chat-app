import { KJSON } from "./helper.types"

export interface UserNotif {
  [key: string]: number
}
export interface UserLocked {
  currtab: boolean
  currcenter: boolean
  currcontent: boolean
}

export type Destroyable = void | string | number | boolean | KJSON
export interface PrimaryClass {
  readonly id: string
  isLocked: boolean
  destroy(): Promise<void>
  update(...args: unknown[]): void | Promise<void>
  run(): void | Promise<void>
}
