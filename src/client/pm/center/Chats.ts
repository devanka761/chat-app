import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"
import { ChatDB, ChatsDB, UserDB } from "../../types/db.types"
import ChatsAPI from "../../properties/ChatsAPI"
import ChatBuilder from "../../properties/ChatBuilder"
import { RoomDetail } from "../../types/room.types"

export default class Chats implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  private card_list: HTMLDivElement
  private list: ChatsAPI
  constructor() {
    this.id = "chats"
    this.isLocked = false
    this.list = new ChatsAPI({ data: [] })
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

      const unread = ch.c.filter((ct) => {
        return ct.userid !== db.me.id && ct.type !== "deleted" && !ct.readers?.includes(db.me.id)
      }).length

      const lastchat = ch.c[ch.c.length - 1]
      const roomDetail: RoomDetail = {
        type: "user",
        id: user.id,
        name: {
          short: user.username,
          full: user.displayname
        },
        img: user.image,
        badges: user.badges
      }
      const card = new ChatBuilder({ data: roomDetail, users: [user], chat: lastchat })
      card.setUnread(unread).run()
      this.list.add(card)
      this.card_list.append(card.html)
    })
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
  update(s: { chat: ChatDB; users: UserDB[]; roomid: string; isFirst: boolean; roomdata: RoomDetail }): void {
    if (s.isFirst) {
      const firstcard = new ChatBuilder({ data: s.roomdata, users: s.users, chat: s.chat })
      firstcard.run()
      this.list.add(firstcard)
    }

    const card = this.list.get(s.roomdata.id)
    if (card) {
      card.addUnread(1).updateChat(s.chat)
      this.card_list.prepend(card.html)
    }
    this.writeIfEmpty(db.c)
  }
  run(): void {
    userState.center = this
    this.createElement()
    culement.app().append(this.el)
    this.writeChatList()
    this.btnListener()
  }
}
