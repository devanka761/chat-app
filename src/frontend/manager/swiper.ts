import userState from "../main/userState"
import { PrimaryClass } from "../types/userState.types"

export default function swiper(newers: PrimaryClass[], olders: PrimaryClass[], instant?: boolean): void {
  const olderlocked = olders.find((older) => older.isLocked)
  if (olderlocked) return

  olders.forEach((older) => {
    older.destroy(instant)
    if (older.king === "center") {
      userState.center = null
    } else if (older.king === "content") {
      userState.content = null
    } else if (older.role === "tab") {
      userState.tab = null
    } else if (older.role === "header") {
      userState.header = null
    }
  })
  newers.forEach((newer) => {
    newer.run()
    if (newer.role !== "posts") {
      newer.isLocked = true
      setTimeout(() => (newer.isLocked = false), 500)
    }
  })
}
