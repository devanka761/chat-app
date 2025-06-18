import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"
import { IChatsF, IMessageF, IRoomDataF, IUserF } from "../../types/db.types"
import ChatsAPI from "../../properties/ChatsAPI"
import ChatBuilder from "../../properties/ChatBuilder"
import { kel, eroot } from "../../helper/kel"

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
    this.el = kel("div", "Chats pmcenter")
    this.card_list = kel("div", "card-list")
    this.el.append(this.card_list)
  }
  private btnListener(): void {}
  private writeChatList(): void {
    const cdb: IChatsF[] = db.c.sort((a, b) => {
      if (a.m[a.m.length - 1].timestamp < b.m[b.m.length - 1].timestamp) return 1
      if (a.m[a.m.length - 1].timestamp > b.m[b.m.length - 1].timestamp) return -1
      return 0
    })
    cdb.forEach((ch) => {
      const user = ch.u.find((usr) => usr.id !== db.me.id)
      if (!user) return

      const unread = ch.m.filter((ct) => {
        return ct.userid !== db.me.id && ct.type !== "deleted" && !ct.readers?.includes(db.me.id)
      }).length

      const lastchat = ch.m[ch.m.length - 1]
      const roomDetail: IRoomDataF = ch.r
      const card = new ChatBuilder({ data: roomDetail, users: [user], chat: lastchat })
      card.setUnread(unread).run()
      this.list.add(card)
      this.card_list.append(card.html)
    })
    this.writeIfEmpty(cdb)
  }
  private writeIfEmpty(cdb: IChatsF[]): void {
    const oldNomore: HTMLParagraphElement | null = this.el.querySelector(".nomore")
    if (cdb.length < 1) {
      if (oldNomore) return
      const nomore = kel("p", "nomore", { e: `${lang.CHTS_NOCHAT}<br/>${lang.CHTS_PLS}` })
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
  update(s: { chat: IMessageF; users: IUserF[]; roomid: string; isFirst: boolean; roomdata: IRoomDataF }): void {
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
    eroot().append(this.el)
    this.writeChatList()
    this.btnListener()
  }
}
