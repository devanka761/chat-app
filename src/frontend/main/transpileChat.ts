import { escapeHTML } from "../helper/escaper"
import { lang } from "../helper/lang"
import db from "../manager/db"
import { IMessageF, IUserF } from "../types/db.types"

const mediaIcons: { [key: string]: string } = {
  file: '<i class="fa-light fa-file"></i>',
  image: '<i class="fa-light fa-image"></i>',
  video: '<i class="fa-light fa-film"></i>',
  audio: '<i class="fa-light fa-music"></i>'
}

export function transpileChat(s: IMessageF, lastuser?: IUserF | null, noStatus?: boolean): string {
  const myId = db.me.id
  let text = ""
  if (lastuser && lastuser.id !== db.me.id) text = `${lastuser.username}: `

  if (s.type === "deleted") {
    text += `<i class="fa-solid fa-ban"></i> <i>${s.userid === myId ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}</i>`
    return text
  }

  if (s.type === "call") {
    text += `<i class="fa-solid fa-phone-volume"></i> Voice Call`
    return text
  } else if (s.type === "image" || s.type === "video" || s.type === "file" || s.type === "audio") {
    text += `${mediaIcons[s.type]} ${s.text ? escapeHTML(s.text) : "Media"}`
  } else if (s.type === "voice") {
    text += `<i class="fa-light fa-microphone"></i> Voice Chat`
  } else {
    text += escapeHTML(s.text || "")
  }

  if (s.userid === myId && !noStatus) {
    const isRead: boolean = (s.readers || []).filter((usrid) => usrid !== myId)?.length >= 1
    text = `<i class="fa-regular fa-check${isRead ? "-double" : ""}"></i> ` + text
  }

  return text
}
