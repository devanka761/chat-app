import { lang } from "./lang"

const sdate = {
  sameday(t1: number | Date, t2: number | Date): boolean {
    t1 = new Date(t1)
    t2 = new Date(t2)
    return t1.getFullYear() === t2.getFullYear() && t1.getMonth() === t2.getMonth() && t1.getDate() === t2.getDate()
  },
  time(tsInp: number | 0 = Date.now(), useSeconds?: boolean): string {
    const ts = typeof tsInp === "number" && tsInp > 0 ? tsInp : Date.now()
    return new Date(ts).toLocaleTimeString(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
      second: useSeconds ? "2-digit" : undefined
    })
  },
  date(ts: number = Date.now()): string {
    return new Date(ts).toLocaleDateString(navigator.language, { year: "2-digit", month: "2-digit", day: "2-digit" })
  },
  parseTime(ts: number = Date.now()): string {
    const sameday = sdate.sameday(Date.now(), ts)
    return sameday ? sdate.time(ts) : sdate.datetime(ts)
  },
  dateOrTime(ts: number = Date.now()) {
    const sameday = sdate.sameday(Date.now(), ts)
    return sameday ? sdate.time(ts) : sdate.date(ts)
  },
  remain(expiryTime: number): string | null {
    const remaining = expiryTime - Date.now()
    return remaining > 0 ? sdate.durrTime(remaining) : null
  },
  datetime(ts: number = Date.now(), pq = null): string {
    return this.date(ts) + (pq ? " " + pq + " " : " ") + this.time(ts)
  },
  timeago(ts: number, islong = false): string {
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
  },
  durrTime(ms: number): string {
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
  },
  durrNumber(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    if (ms > 1000 * 60 * 45) return "Error"

    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const result = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
    return result.trim()
  }
}

export default sdate
