import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"
import { IChatsF, IMessageF, IRoomDataF, IUserF } from "../../types/db.types"
import ChatsAPI from "../../properties/ChatsAPI"
import ChatBuilder from "../../properties/ChatBuilder"
import { kel, epm } from "../../helper/kel"
import { TChatsTypeF } from "../../types/room.types"
import FolderCard from "../parts/FolderCard"
import FolderAPI from "../../properties/FolderAPI"
import noMessage from "../../helper/noMessage"
import xhr from "../../helper/xhr"
import adap from "../../main/adaptiveState"
import Room from "../content/Room"

const typeOrder: { [key: string]: number } = {
  all: 1,
  unread: 4,
  user: 2,
  group: 3
}

export default class Chats implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  private card_list: HTMLDivElement
  list: ChatsAPI
  private folders: FolderAPI
  private type_list: HTMLDivElement
  constructor() {
    this.king = "center"
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
      .filter((ch) => ch.r.type === "group" || (ch.m && ch.m.length >= 1))
      .forEach((ch) => {
        const unread = ch.m.filter((ct) => {
          return ct.userid !== db.me.id && ct.type !== "deleted" && ct.type !== "call" && !ct.readers?.includes(db.me.id)
        }).length

        const lastchat = ch.m[ch.m.length - 1] || noMessage()
        const roomDetail: IRoomDataF = ch.r
        const card = new ChatBuilder({ data: roomDetail, users: ch.u, chat: lastchat, parent: this })
        card.setUnread(unread).run()
        this.list.add(card)
        this.card_list.append(card.html)
      })
    this.writeIfEmpty()
    this.renderGlobalCard()
  }
  private renderGlobalCard(): void {
    const card = kel("div", "btn btn-global")
    card.innerHTML = '<i class="fa-solid fa-earth-asia"></i> <span>Global Chat</span>'
    this.card_list.append(card)
    card.onclick = async () => {
      if (this.isLocked) return

      const hasGlobalChat = db.c.find((ch) => ch.r.id === "696969")
      if (hasGlobalChat) {
        this.setGlobalChats(hasGlobalChat)
        this.isLocked = false
        return
      }

      this.isLocked = true
      const getGlobalChats = await modal.loading(xhr.get("/x/room/get-global"))
      if (!getGlobalChats || !getGlobalChats.ok) {
        await modal.alert(lang[getGlobalChats.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      this.isLocked = false
      this.setGlobalChats(getGlobalChats.data)
    }
  }
  private setGlobalChats(data: IChatsF): void {
    if (!db.c.find((ch) => ch.r.id === data.r.id)) {
      db.c.push(data)
      this.update({
        chat: data.m[data.m.length - 1] || noMessage(),
        users: data.u,
        roomdata: data.r
      })
    }

    if (userState.content?.role === "room") {
      if (userState.content.isLocked) return
      const room = userState.content as Room
      if (room.key === data.r.id) return
    }
    const newRoomChat = new Room({
      data: data.r,
      users: data.u
    })
    adap.swipe(newRoomChat)
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
  private writeIfEmpty(): void {
    const oldNomore: HTMLParagraphElement | null = this.el.querySelector(".nomore")
    if (this.list.entries.length < 1) {
      if (oldNomore) return
      const nomore = kel("p", "nomore", { e: `${lang.CHTS_NOCHAT}<br/>${lang.CHTS_PLS}` })
      this.card_list.prepend(nomore)
    } else {
      if (oldNomore) oldNomore.remove()
    }
  }
  public setTypeList(chatType: TChatsTypeF = "all"): void {
    this.folders.enabled = chatType
    if (chatType === "user" || chatType === "group") {
      this.list.entries.forEach((chat) => {
        if (chat.data.type === chatType) {
          chat.show()
        } else {
          chat.hide()
        }
      })
    } else if (chatType === "unread") {
      this.list.entries.forEach((chat) => {
        if (chat.unread < 1) {
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
    if (card) {
      card.html.remove()
      this.list.remove(roomid)
    }
    this.folders.entries.forEach((folder) => folder.updateUnread())
    this.writeIfEmpty()
  }
  update(s: { chat: IMessageF; users: IUserF[]; roomdata: IRoomDataF }): void {
    let card = this.list.get(s.roomdata.id)
    if (!card) {
      card = new ChatBuilder({ data: s.roomdata, users: s.users, chat: s.chat, parent: this }).run()
      this.list.add(card)
    }
    const read = s.chat.userid === db.me.id || (s.chat.readers && s.chat.readers.find((usr) => usr === db.me.id)) || s.chat.type === "deleted" || s.chat.type === "call" || s.chat.id === "-1"
    if (!read) card.addUnread(1)
    card.updateChat(s.chat, s.roomdata)
    this.card_list.prepend(card.html)
    this.setTypeList(this.folders.enabled)

    this.folders.entries.forEach((folder) => folder.updateUnread())
    this.writeIfEmpty()
  }
  setUnread(roomid: string, unread: number) {
    const card = this.list.get(roomid)
    if (card) card.setUnread(unread)
    this.folders.entries.forEach((folder) => folder.updateUnread())
  }
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
    this.list.entries.forEach((ch) => {
      this.list.remove(ch.id)
    })
    this.folders.entries.forEach((folder) => {
      this.folders.remove(folder.json.type)
    })
  }
  run(): void {
    userState.center = this
    this.createElement()
    epm().append(this.el)
    this.writeTypeList()
    this.writeChatList()
    this.setTypeList(this.folders.enabled)
  }
}
