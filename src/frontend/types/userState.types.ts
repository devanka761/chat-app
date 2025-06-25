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
  readonly role: string
  isLocked: boolean
  king?: "center" | "content"
  classBefore?: PrimaryClass
  destroy(arg?: any): Promise<void>
  update(...args: any[]): void | Promise<void>
  run(): any
}
