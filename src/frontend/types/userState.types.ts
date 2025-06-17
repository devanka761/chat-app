/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserNotif {
  [key: string]: number
}
export interface UserLocked {
  currtab: boolean
  currcenter: boolean
  currcontent: boolean
}

export interface PrimaryClass {
  readonly id: string
  isLocked: boolean
  destroy(): Promise<void>
  update(...args: any[]): void | Promise<void>
  run(): void | Promise<void>
}
