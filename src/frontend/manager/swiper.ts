import { PrimaryClass } from "../types/userState.types"

export default async function swiper(newer: PrimaryClass, older: PrimaryClass | null, isWait?: boolean): Promise<void> {
  if (older?.isLocked) return
  // if (older) await older.destroy()
  if (isWait && older) {
    await older.destroy()
  } else if (older) {
    older.destroy()
  }
  newer.run()
}
