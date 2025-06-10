import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import { escapeHTML, ss } from "../../helper/escaper"
import userState from "../../main/userState"
import db from "../../manager/db"
import { ChatCard } from "../../types/chats.types"
import sdate from "../../helper/sdate"
import { PrimaryClass } from "../../types/userState.types"
import { ChatDB, ChatsDB, UserDB } from "../../types/db.types"
import swiper from "../../manager/swiper"
import Room from "../content/Room"
import { RoomDetail } from "../../types/room.types"
import { PossibleData } from "../../types/helper.types"

function transpile_lastchat(s: ChatDB): string {
  const myId = <string>db.me.id
  let text = ""

  if (s.type === "deleted") {
    text += `<i class="fa-solid fa-ban"></i> <i>${s.userid === myId ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}</i>`
    return text
  }

  if (s.type === "call") {
    text += `<i class="fa-solid fa-phone-volume"></i> Voice Call`
    return text
  } else if (s.type === "image" || s.type === "video" || s.type === "file") {
    const trp = { image: "image", video: "film", file: "file" }
    text += `<i class="fa-light fa-${trp[s.type]}"></i> ` + (s.text ? escapeHTML(ss(s.text)) : "Media")
  } else if (s.type === "audio") {
    text += `<i class="fa-light fa-microphone"></i> Voice Chat`
  } else {
    text += escapeHTML(ss(<string>s.text))
  }

  if (s.userid === myId) {
    const isRead: boolean = (s.watch || []).filter((usrid) => usrid !== myId)?.length >= 1
    text = `<i class="fa-regular fa-check${isRead ? "-double" : ""}"></i> ` + text
  }

  return text
}

function dateTime(timestamp: number): string {
  const sameDay = sdate.sameday(Date.now(), timestamp)
  return sameDay ? sdate.time(timestamp) : sdate.date(timestamp)
}

function chat_card(s: ChatCard): { [key: string]: HTMLDivElement } {
  const { user, lastchat, unread } = s
  const card = kelement("div", "card")
  card.id = "chatlist-" + user.id
  const eleft = kelement("div", "left")
  const eright = kelement("div", "right")
  const ecimg = kelement("div", "img")
  const img = new Image()
  img.alt = user.username
  img.onerror = () => (img.src = "/assets/user.jpg")
  img.src = user.image ? `/file/user/${user.image}` : "/assets/user.jpg"
  img.width = 50
  const edetail = kelement("div", "detail")
  const eusername = kelement("div", "name", { e: `<div class="name"><p>${user.username}</p></div>` })
  const elastchat = kelement("div", "last", { e: transpile_lastchat(lastchat) })

  const elastts = kelement("div", "last", { e: dateTime(s.lastchat.timestamp) })
  const eunread = kelement("div", "unread", { e: unread.toString() })

  card.append(eleft, eright)
  eleft.append(ecimg, edetail)
  ecimg.append(img)
  edetail.append(eusername, elastchat)
  eright.append(elastts)
  if (unread >= 1) eright.append(unread.toString())

  return { card, eusername, elastchat, elastts, eunread }
}

export default class Chats implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  private card_list: HTMLDivElement
  constructor() {
    this.id = "chats"
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kelement("div", "Chats pmcenter")
    this.card_list = kelement("div", "card-list")
    this.el.append(this.card_list)
  }
  private btnListener(): void {}
  private writeChatList(): void {
    const cdb: ChatsDB[] = db.c.sort((a, b) => {
      if (a.c[a.c.length - 1].timestamp < b.c[b.c.length - 1].timestamp) return 1
      if (a.c[a.c.length - 1].timestamp > b.c[b.c.length - 1].timestamp) return -1
      return 0
    })
    cdb.forEach((ch) => {
      const user = ch.u.find((usr) => usr.id !== db.me.id)
      if (!user) return
      // const inbox = Object.values(ch.c)
      const unread = ch.c.filter((ct) => {
        return ct.userid !== db.me.id && ct.type !== "deleted" && !ct.watch?.includes(db.me.id)
      }).length

      const lastchat = ch.c[ch.c.length - 1]
      const { card } = chat_card({ user, lastchat, unread })
      card.onclick = () => {
        const roomDetail: RoomDetail = {
          type: "user",
          id: user.id,
          name: {
            short: user.username,
            full: user.displayname
          }
        }
        if (user.badges) roomDetail.badges = user.badges
        if (user.image) roomDetail.img = user.image
        swiper(new Room({ data: roomDetail, users: [user] }), userState.currcontent)
      }
      this.card_list.append(card)
    })

    // THESE ARE ONLY FOR PLACEHOLDER TO CHECK THE CSS STYLES
    // const { card } = chat_card({
    //   user: { userid: "666666", username: "Rudi02" },
    //   lastchat: {
    //     timestamp: 1747678809977,
    //     type: "text",
    //     userid: "666666",
    //     watch: [],
    //     text: "Hehehe"
    //   },
    //   unread: 1
    // })
    // this.card_list.append(card)

    this.writeIfEmpty(cdb)
  }
  private writeIfEmpty(cdb: ChatsDB[]): void {
    const oldNomore: HTMLParagraphElement | null = this.el.querySelector(".nomore")
    if (cdb.length < 1) {
      if (oldNomore) return
      const nomore = kelement("p", "nomore", { e: `${lang.CHTS_NOCHAT}<br/>${lang.CHTS_PLS}` })
      this.card_list.append(nomore)
    } else {
      if (oldNomore) oldNomore.remove()
    }
  }
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  update(sc: PossibleData, su: PossibleData): void {}
  run(): void {
    userState.center = this
    this.createElement()
    culement.app().append(this.el)
    this.writeChatList()
    this.btnListener()
  }
}
