import { epm, kel } from "../../helper/kel"
import modal from "../../helper/modal"
import noUser from "../../helper/noUser"
import userState from "../../main/userState"
import db from "../../manager/db"
import ContactsAPI from "../../properties/ContactAPI"
import FriendBuilder from "../../properties/FriendBuilder"
import FriendsAPI from "../../properties/FriendsAPI"
import { IRoomDataF, IUserF } from "../../types/db.types"
import { TFriendsTypeF } from "../../types/room.types"
import { PrimaryClass } from "../../types/userState.types"
import ContactCard from "../parts/ContactCard"

const typeOrder: { [key: string]: number } = {
  friend: 2,
  request: 1
}

export default class Friends implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  private card_list: HTMLDivElement
  private type_list: HTMLDivElement
  private list: FriendsAPI
  private contacts: ContactsAPI
  constructor() {
    this.king = "center"
    this.isLocked = false
    this.role = "friends"
    this.list = new FriendsAPI({ data: [] })
    this.contacts = new ContactsAPI({ data: [] })
  }
  createElement(): void {
    this.card_list = kel("div", "card-list")
    this.type_list = kel("div", "type-list")
    this.el = kel("div", "Chats pmcenter")
    this.el.append(this.type_list, this.card_list)
  }
  private writeFriendList(): void {
    const friendreq: IUserF[] = db.me.req || []
    const friendlist = db.c
      .filter((ch) => ch.u.find((usr) => usr.id === ch.r.id && usr.isFriend === 1))
      .map((ch) => ch.u.find((usr) => usr.id === ch.r.id) || noUser())
      .filter((usr) => usr.id !== "-1")
    const users: IUserF[] = [...friendreq, ...friendlist]

    users.forEach((usr) => {
      const card = new FriendBuilder({ user: usr, parent: this }).run()
      this.list.add(card)
      this.card_list.append(card.html)
    })
  }
  private writeTypeList(): void {
    Object.keys(typeOrder)
      .sort((a, b) => {
        if (typeOrder[a] > typeOrder[b]) return 1
        if (typeOrder[a] < typeOrder[b]) return -1
        return 0
      })
      .forEach((k) => {
        const card = new ContactCard({ friends: this, typeName: k as TFriendsTypeF }).run()
        this.contacts.add(card)
        this.type_list.append(card.html)
      })
  }
  setTypeList(friendType: TFriendsTypeF = "friend"): void {
    this.contacts.enabled = friendType
    this.list.entries.forEach((member) => {
      const memberMatch = member.user.isFriend === 1 ? "friend" : "request"
      if (friendType === memberMatch) {
        member.show()
      } else {
        member.hide()
      }
    })
  }
  update(isFriend: number, s: { user: IUserF; room: IRoomDataF }): void {
    if (isFriend === 1) {
      this.addToFriend(s.user)
    } else if (isFriend === 3) {
      this.addToReq(s.user)
    } else {
      this.removeFromList(s.user)
    }
    this.contacts.entries.forEach((folder) => {
      folder.updateUnread()
    })
  }
  addToFriend(user: IUserF): void {
    const friend = this.list.get(user.id) || this.list.add(new FriendBuilder({ user: user })).run()
    friend.user.isFriend = 1
    this.card_list.prepend(friend.html)
    if (this.contacts.enabled === "friend") {
      return friend.show()
    }
    friend.hide()
  }
  addToReq(user: IUserF): void {
    const friend = this.list.get(user.id) || this.list.add(new FriendBuilder({ user: user })).run()
    friend.user.isFriend = 3
    this.card_list.prepend(friend.html)
    if (this.contacts.enabled === "request") {
      return friend.show()
    }
    friend.hide()
  }
  removeFromList(user: IUserF): void {
    const friend = this.list.get(user.id)
    if (friend) {
      this.card_list.removeChild(friend.html)
      this.list.remove(friend.id)
    }
  }
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
    this.list.entries.forEach((ch) => {
      this.list.remove(ch.id)
    })
    this.contacts.entries.forEach((contact) => {
      this.contacts.remove(contact.type)
    })
  }
  run(): void {
    userState.center = this
    this.createElement()
    epm().append(this.el)
    this.writeTypeList()
    this.writeFriendList()
    this.setTypeList(this.contacts.enabled)
  }
}
