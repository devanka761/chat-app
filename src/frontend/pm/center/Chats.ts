import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"
import { IChatsF, IMessageF, IRoomDataF, IUserF } from "../../types/db.types"
import ChatsAPI from "../../properties/ChatsAPI"
import ChatBuilder from "../../properties/ChatBuilder"
import { kel, eroot } from "../../helper/kel"
import { TChatsTypeF } from "../../types/room.types"
import FolderCard from "../parts/FolderCard"
import FolderAPI from "../../properties/FolderAPI"
import noMessage from "../../helper/noMessage"

const typeOrder: { [key: string]: number } = {
  all: 1,
  unread: 4,
  user: 2,
  group: 3
}

export default class Chats implements PrimaryClass {
  readonly role: string
  public isLocked: boolean
  private el: HTMLDivElement
  private card_list: HTMLDivElement
  private list: ChatsAPI
  private folders: FolderAPI
  private type_list: HTMLDivElement
  constructor() {
    this.role = "chats"
    this.isLocked = false
    this.list = new ChatsAPI({ data: [] })
    this.folders = new FolderAPI({ data: [] })
  }
  private createElement(): void {
    this.el = kel("div", "Chats pmcenter")
    this.card_list = kel("div", "card-list")
    this.type_list = kel("div", "type-list")
    this.el.append(this.type_list, this.card_list)
  }
  private writeChatList(): void {
    const cdb: IChatsF[] = db.c.sort((a, b) => {
      if ((a.m[a.m.length - 1]?.timestamp || 0) < (b.m[b.m.length - 1]?.timestamp || 0)) return 1
      if ((a.m[a.m.length - 1]?.timestamp || 0) > (b.m[b.m.length - 1]?.timestamp || 0)) return -1
      return 0
    })
    cdb
      .filter((ch) => ch.m && ch.m.length >= 1)
      .forEach((ch) => {
        const unread = ch.m.filter((ct) => {
          return ct.userid !== db.me.id && ct.type !== "deleted" && !ct.readers?.includes(db.me.id)
        }).length

        const lastchat = ch.m[ch.m.length - 1] || noMessage()
        const roomDetail: IRoomDataF = ch.r
        const card = new ChatBuilder({ data: roomDetail, users: ch.u, chat: lastchat })
        card.setUnread(unread).run()
        this.list.add(card)
        this.card_list.append(card.html)
      })
    this.writeIfEmpty(cdb)
  }
  private writeTypeList(): void {
    Object.keys(typeOrder)
      .sort((a, b) => {
        if (typeOrder[a] > typeOrder[b]) return 1
        if (typeOrder[a] < typeOrder[b]) return -1
        return 0
      })
      .forEach((k) => {
        const card = new FolderCard({ chats: this, typeName: k as TChatsTypeF }).run()
        this.folders.add(card)
        this.type_list.append(card.html)
      })
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
  public setTypeList(chatType: TChatsTypeF = "all"): void {
    this.folders.enabled = chatType
    if (chatType === "user" || chatType === "group") {
      this.list.entries.forEach((chat) => {
        if (chat.json.data.type === chatType) {
          chat.show()
        } else {
          chat.hide()
        }
      })
    } else if (chatType === "unread") {
      this.list.entries.forEach((chat) => {
        if (chat.json.unread < 1) {
          chat.hide()
        } else {
          chat.show()
        }
      })
    } else {
      this.list.entries.forEach((chat) => chat.show())
    }
  }
  updateData(roomdata: IRoomDataF): void {
    const card = this.list.get(roomdata.id)
    if (card) card.updateData(roomdata)
  }
  deleteData(roomid: string): void {
    const card = this.list.get(roomid)
    if (card) card.html.remove()
    const cdb = db.c.find((k) => k.r.id === roomid)
    if (cdb) db.c = db.c.filter((k) => k.r.id !== roomid)
    this.folders.entries.forEach((folder) => folder.updateUnread())
    this.writeIfEmpty(db.c)
  }
  update(s: { chat: IMessageF; users: IUserF[]; roomid: string; isFirst: boolean; roomdata: IRoomDataF }): void {
    if (s.isFirst) {
      const firstcard = new ChatBuilder({ data: s.roomdata, users: s.users, chat: s.chat })
      firstcard.run()
      this.list.add(firstcard)
    }

    const card = this.list.get(s.roomdata.id)
    if (card) {
      if (s.chat.userid !== db.me.id) card.addUnread()
      card.updateChat(s.chat, s.roomdata)
      this.card_list.prepend(card.html)
      this.setTypeList(this.folders.enabled)
    }
    this.folders.entries.forEach((folder) => folder.updateUnread())
    this.writeIfEmpty(db.c)
  }
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.center = this
    this.createElement()
    eroot().append(this.el)
    this.writeTypeList()
    this.writeChatList()
    this.setTypeList()
  }
}
