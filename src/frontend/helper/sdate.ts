import { lang } from "./lang"

export function sameday(t1: number | Date, t2: number | Date): boolean {
  t1 = new Date(t1)
  t2 = new Date(t2)
  return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate()
}
export function stime(ts: number = Date.now()): string {
  return new Date(ts).toLocaleTimeString(navigator.language, { hour: "2-digit", minute: "2-digit" })
}
export function sdate(ts: number = Date.now()): string {
  return new Date(ts).toLocaleDateString(navigator.language, { year: "2-digit", month: "2-digit", day: "2-digit" })
}
export function parseTime(ts: number = Date.now()): string {
  const isSame = sameday(Date.now(), ts)
  return isSame ? stime(ts) : datetime(ts)
}
export function dateOrTime(ts: number = Date.now()) {
  const isSame = sameday(Date.now(), ts)
  return isSame ? stime(ts) : sdate(ts)
}
export function remainTime(expiryTime: number): string | null {
  const remaining = expiryTime - Date.now()
  return remaining > 0 ? durrTime(remaining) : null
}
export function datetime(ts: number = Date.now(), pq = null): string {
  return sdate(ts) + (pq ? " " + pq + " " : " ") + stime(ts)
}
export function stimeago(ts: number, islong = false): string {
  const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return `${interval} ${lang.SDATE_YEARS}${islong ? " " + lang.SDATE_AGO : ""}`

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return `${interval} ${lang.SDATE_MONTHS}${islong ? " " + lang.SDATE_AGO : ""}`

  interval = Math.floor(seconds / 604800)
  if (interval >= 1) return `${interval} ${lang.SDATE_WEEKS}${islong ? " " + lang.SDATE_AGO : ""}`

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return `${interval} ${lang.SDATE_DAYS}${islong ? " " + lang.SDATE_AGO : ""}`

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return `${interval} ${lang.SDATE_HOURS}${islong ? " " + lang.SDATE_AGO : ""}`

  interval = Math.floor(seconds / 60)
  if (interval >= 1) return `${interval} ${lang.SDATE_MINUTES}${islong ? " " + lang.SDATE_AGO : ""}`

  interval = Math.floor(seconds / 1)
  if (interval >= 1) return `${seconds} ${lang.SDATE_SECONDS}${islong ? " " + lang.SDATE_AGO : ""}`

  return `${lang.SDATE_JUSTNOW}`
}
export function durrTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 3600 / 24)
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let result = ""
  if (days > 0) {
    result += `${days}${lang.SDATE_sDAYS} `
  }
  if (hours > 0) {
    result += `${hours}${lang.SDATE_sHOURS} `
  }
  if (minutes > 0) {
    result += `${minutes}${lang.SDATE_sMINUTES} `
  }
  if (seconds > 0 || result === "") {
    result += `${seconds}${lang.SDATE_sSECONDS}`
  }
  return result.trim()
}

export default sdate
