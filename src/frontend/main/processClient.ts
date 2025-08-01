import { IZender } from "../../backend/types/validate.types"
import { escapeHTML } from "../helper/escaper"
import { lang } from "../helper/lang"
import modal from "../helper/modal"
import noMessage from "../helper/noMessage"
import notip from "../helper/notip"
import db from "../manager/db"
import negotiator from "../manager/negotiator"
import ForceClose from "../pages/ForceClose"
import Calls from "../pm/center/Calls"
import Chats from "../pm/center/Chats"
import Friends from "../pm/center/Friends"
import Group from "../pm/content/Group"
import Room from "../pm/content/Room"
import Tab from "../pm/parts/header/Tab"
import Incoming from "../pm/parts/media/Incoming"
import VCall from "../pm/parts/media/VCall"
import { IRoomDataF, IUserF } from "../types/db.types"
import { IMessageUpdateF } from "../types/message.types"
import { ICallUpdateF } from "../types/peer.types"
import userState from "./userState"

class ProcessClient {
  private newLoggedIn(): void {
    // <i class="fa-solid fa-user-secret"></i>
    new ForceClose({
      msg_1: '<i class="fa-duotone fa-light fa-user-secret"></i>',
      msg_2: lang.CLOUD_SAME_TIME
    })
  }
  private addfriend(s: { user: IUserF }): void {
    const user = s.user
    const room: IRoomDataF = {
      id: user.id,
      long: user.displayname,
      short: user.username,
      type: "user",
      badges: user.badges,
      image: user.image
    }
    const userExist = db.me.req && db.me.req.find((usr) => usr.id === user.id)
    if (userExist) return
    if (!db.me.req) db.me.req = []
    db.me.req.push(s.user)
    if (userState.notif.a02 && userState.notif.a02 >= 1)
      notip({
        ic: "face-sunglasses",
        a: escapeHTML(user.username),
        b: lang.NOTIP_RECIEVE_FRIEND_REQUESTS
      })
    if (!userState.center || (userState.center.role !== "friends" && userState.center.role !== "find")) {
      if (userState.tab) {
        const tab = userState.tab as Tab
        tab.update("friends")
      }
    }
    if (userState.center?.role === "friends") {
      const friendcenter = userState.center as Friends
      friendcenter.update(user.isFriend || 0, { user, room })
    }
  }
  private unfriend(s: { user: IUserF }): void {
    const user = s.user
    const room: IRoomDataF = {
      id: user.id,
      long: user.displayname,
      short: user.username,
      type: "user",
      badges: user.badges,
      image: user.image
    }
    const currChat = db.c.find((ch) => ch.r.id === s.user.id)
    const currUser = currChat?.u.find((usr) => usr.id === s.user.id)
    if (currChat && currUser) currUser.isFriend = user.isFriend
    if (!userState.center || (userState.center.role !== "friends" && userState.center.role !== "find")) {
      if (userState.tab) {
        const tab = userState.tab as Tab
        tab.update("friends")
      }
    }
    if (userState.center?.role === "friends") {
      const friendcenter = userState.center as Friends
      friendcenter.update(user.isFriend || 0, { user, room })
    }
  }
  private acceptfriend(s: { user: IUserF }): void {
    const user = s.user
    if (db.me.req) {
      db.me.req = db.me.req.filter((usr) => usr.id !== user.id)
    }
    const room: IRoomDataF = {
      id: user.id,
      long: user.displayname,
      short: user.username,
      type: "user",
      badges: user.badges,
      image: user.image
    }
    let currChat = db.c.find((ch) => ch.r.id === s.user.id)
    if (!currChat) {
      db.c.push({
        r: room,
        u: [user],
        m: []
      })
    }
    currChat = db.c.find((ch) => ch.r.id === s.user.id)
    const currUser = currChat?.u.find((usr) => usr.id === s.user.id)
    if (currChat && currUser) currUser.isFriend = user.isFriend

    if (userState.notif.a02 && userState.notif.a02 >= 1)
      notip({
        ic: "user-check",
        a: escapeHTML(user.username),
        b: lang.NOTIP_RECIEVE_FRIEND_ACCEPT
      })

    if (!userState.center || (userState.center.role !== "friends" && userState.center.role !== "find")) {
      if (userState.tab) {
        const tab = userState.tab as Tab
        tab.update("friends")
      }
    }

    if (userState.center?.role === "friends") {
      const friendCenter = userState.center as Friends
      friendCenter.update(user.isFriend || 0, { user, room })
    }
  }
  private cancelfriend(s: { user: IUserF }): void {
    const user = s.user
    const room: IRoomDataF = {
      id: user.id,
      long: user.displayname,
      short: user.username,
      type: "user",
      badges: user.badges,
      image: user.image
    }
    if (db.me.req) {
      db.me.req = db.me.req.filter((usr) => usr.id !== user.id)
    }
    if (!userState.center || (userState.center.role !== "friends" && userState.center.role !== "find")) {
      if (userState.tab) {
        const tab = userState.tab as Tab
        tab.update("friends")
      }
    }

    if (userState.center?.role === "friends") {
      const friendCenter = userState.center as Friends
      friendCenter.update(user.isFriend || 0, { user, room })
    }
  }
  // ignorefriend
  private sendmessage(s: IMessageUpdateF): void {
    let isVisible = false
    let dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (!dbchat && s.roomdata.id === "696969") return
    if (!dbchat) {
      db.c.push({
        m: [],
        r: s.roomdata,
        u: s.users
      })
    }
    dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (dbchat) {
      const oldUsr = dbchat.u.find((usr) => usr.id === s.sender?.id)
      if (!oldUsr && dbchat.r.id === "696969" && s.sender) dbchat.u.push(s.sender)
      const oldDB = dbchat.m.find((ch) => ch.id === s.chat.id)
      if (oldDB) {
        oldDB.text = s.chat.text
        oldDB.timestamp = s.chat.timestamp
        oldDB.edited = s.chat.edited
      } else {
        dbchat.m.push(s.chat)
      }
    }
    if (userState.content && userState.content.role === "room") {
      const room = userState.content as Room
      if (room.data.id === s.roomdata.id) {
        isVisible = true
        room.update(s)
      }
    }

    if (userState.center && userState.center.role === "chats") {
      isVisible = true
      const chatcenter = userState.center as Chats
      const roomdata = db.c.find((ch) => ch.r.id === s.roomdata.id)
      if (roomdata) {
        chatcenter.update({
          chat: s.chat,
          users: roomdata.u,
          roomdata: roomdata.r
        })
      }
    }

    if (s.chat.type === "call" && s.chat.duration != -2 && userState.center?.role === "calls") {
      const callcenter = userState.center as Calls
      callcenter.addToList({ message: s.chat, users: s.users })
    }

    if (!isVisible && userState.notif.a01 && userState.notif.a01 >= 1) {
      notip({
        ic: "message-dots",
        a: s.roomdata.short,
        b: lang.NOTIP_RECEIVE_MSG
      })
    }

    userState.tab?.update("chats")
  }
  private editmessage(s: IMessageUpdateF): void {
    const dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (!dbchat && s.roomdata.id === "696969") return
    const oldDB = dbchat?.m.find((ch) => ch.id === s.chat.id)
    if (oldDB) {
      if (s.chat.type === "text") {
        oldDB.text = s.chat.text
        oldDB.edited = s.chat.edited
      } else if (s.chat.type === "call") {
        oldDB.duration = s.chat.duration
      }
    }

    if (userState.content && userState.content.role === "room") {
      const room = userState.content as Room
      if (room.data.id === s.roomdata.id) {
        room.update(s)
      }
    }

    if (userState.center && userState.center.role === "chats") {
      const chatcenter = userState.center as Chats
      const roomdata = db.c.find((ch) => ch.r.id === s.roomdata.id)
      if (roomdata && dbchat && dbchat.m[dbchat.m.length - 1].id === s.chat.id) {
        chatcenter.update({
          chat: s.chat,
          users: roomdata.u,
          roomdata: roomdata.r
        })
      }
    }
    if (s.chat.type === "call" && s.chat.duration != -2 && userState.center?.role === "calls") {
      const callcenter = userState.center as Calls
      callcenter.addToList({ message: s.chat, users: s.users })
    }
    userState.tab?.update("chats")
  }
  private deletemessage(s: IMessageUpdateF): void {
    const dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (!dbchat && s.roomdata.id === "696969") return
    if (dbchat) {
      const oldDB = dbchat.m.find((ch) => ch.id === s.chat.id)
      if (oldDB) {
        oldDB.text = "deleted"
        oldDB.edited = undefined
        oldDB.source = undefined
        oldDB.type = "deleted"
      }
    }

    if (userState.content && userState.content.role === "room") {
      const room = userState.content as Room
      if (room.data.id === s.roomdata.id) {
        room.update(s)
      }
    }

    if (userState.center && userState.center.role === "chats") {
      const chatcenter = userState.center as Chats
      const roomdata = db.c.find((ch) => ch.r.id === s.roomdata.id)
      if (roomdata && dbchat && dbchat.m[dbchat.m.length - 1].id === s.chat.id) {
        chatcenter.update({
          chat: s.chat,
          users: roomdata.u,
          roomdata: roomdata.r
        })
      }
    }
    userState.tab?.update("chats")
  }
  private readAllMessages(s: IZender): void {
    const cdb = db.c.find((ch) => ch.r.type === "user" && ch.r.id === s.from)
    if (cdb) {
      cdb.m
        .filter((msg) => msg.userid === db.me.id && (!msg.readers || !msg.readers.find((usr) => usr === s.from)))
        .forEach((msg) => {
          if (!msg.readers) msg.readers = []
          msg.readers.push(s.from)
        })
    }

    if (userState.content && userState.content.role === "room") {
      const roomContent = userState.content as Room
      if (roomContent.data.id !== s.from) return
      roomContent.field.list.entries.forEach((msg) => {
        if (msg.json.user.id === db.me.id) {
          msg.setStatus("read")
        }
      })
    }
    userState.tab?.update("chats")
  }
  private clearhistory(s: IZender): void {
    const gdb = db.c.find((ch) => ch.r.id === s.roomid)
    if (!gdb) return
    gdb.m = []

    if (userState.center && userState.center.role === "chats") {
      const chatCenter = userState.center as Chats
      chatCenter.update({
        chat: noMessage(),
        roomdata: gdb.r,
        users: gdb.u
      })
    }
    if (userState.content && userState.content.role === "room") {
      const room = userState.content as Room
      if (room.data.id === s.roomid) {
        room.field.list.entries.forEach((msg) => {
          msg.html.remove()
          room.field.list.remove(msg.id)
        })
      }
    }
  }
  private memberjoin(s: IZender): void {
    const gdb = db.c.find((ch) => ch.r.id === s.groupid)
    if (!gdb) return
    const user = s.user as IUserF
    const userExists = gdb.u.find((usr) => usr.id === s.from)
    if (userExists) return
    gdb.u.push(user)
    if (userState.center?.role === "chats") {
      const chatsCenter = userState.center as Chats
      const chatCard = chatsCenter.list.get(s.groupid)
      if (chatCard && !chatCard.users.find((usr) => usr.id === s.from)) {
        chatCard.users.push(user)
      }
    }

    if (userState.content?.role === "room") {
      const roomContent = userState.content as Room
      if (roomContent.data.id === s.groupid && !roomContent.users.find((usr) => usr.id === s.from)) {
        roomContent.users.push(user)
        roomContent.tab.users = roomContent.users
      }
    }
    if (userState.content?.role === "group") {
      const groupContent = userState.content as Group
      if (groupContent.group.id === s.groupid && !groupContent.members.get(user.id)) {
        groupContent.addMember(user)
      }
    }
  }
  private memberleave(s: IZender): void {
    const gdb = db.c.find((ch) => ch.r.id === s.groupid)
    if (!gdb) return

    const udb = gdb.u.find((usr) => usr.id === s.from)
    if (!udb) return

    if (userState.center?.role === "chats") {
      const chatsCenter = userState.center as Chats
      const chatCard = chatsCenter.list.get(s.groupid)
      if (chatCard) {
        chatCard.users = chatCard.users.filter((usr) => usr.id !== s.from)
      }
    }
    if (userState.content?.role === "room") {
      const roomContent = userState.content as Room
      if (roomContent.data.id === s.groupid) {
        roomContent.users = roomContent.users.filter((usr) => usr.id !== s.from)
        roomContent.tab.users = roomContent.users
      }
    }
    if (userState.content?.role === "group") {
      const groupContent = userState.content as Group
      if (groupContent.group.id === s.groupid) {
        groupContent.members.remove(s.from)
      }
    }

    gdb.u = gdb.u.filter((usr) => usr.id !== s.from)
  }
  private async memberkick(s: IZender): Promise<void> {
    const gdb = db.c.find((ch) => ch.r.id === s.groupid)
    if (gdb) db.c = db.c.filter((ch) => ch.r.id !== s.groupid)
    if (userState.center?.role === "chats") {
      const chatsCenter = userState.center as Chats
      chatsCenter.deleteData(s.groupid)
    }
  }
  private offer(s: ICallUpdateF): void {
    if (!negotiator[s.user.id]) negotiator[s.user.id] = []
    negotiator[s.user.id].push(s)

    const incoming = new Incoming({ data: s })
    incoming.run()
  }
  private answer(s: ICallUpdateF) {
    if (!userState.media) {
      if (!negotiator[s.user.id]) negotiator[s.user.id] = []
      negotiator[s.user.id].push(s)
      return
    }
    const vcall = userState.media as VCall
    vcall.peer.handleSignal(s)
  }
  private candidate(s: ICallUpdateF): void {
    this.answer(s)
  }
  private hangup(s: ICallUpdateF): void {
    const vcall = userState.media as VCall | null
    if (vcall && s.user.id === vcall.user.id) {
      vcall.waiting = "hangup"
      vcall.destroy()
    }
    const incomingCall = userState.incoming as Incoming | null
    if (incomingCall && s.user.id === incomingCall.user.id) {
      incomingCall.destroy()
    }
  }
  private reject(s: ICallUpdateF): void {
    const vcall = userState.media as VCall | null
    if (vcall && s.user.id === vcall.user.id) {
      notip({ ic: "phone-hangup", a: s.user.username, b: lang.CALL_REJECTION, c: "4" })
      vcall.destroy()
      modal.alert({ ic: "phone-hangup", msg: `${s.user.username} ${lang.CALL_REJECTION}` })
    }
  }
  private calloffline(s: ICallUpdateF): void {
    const vcall = userState.media as VCall | null
    if (vcall && s.user.id === vcall.user.id) {
      notip({ ic: "signal-slash", a: s.user.username, b: lang.CALL_OFFLINE, c: "4" })
      vcall.destroy()
      modal.alert({ ic: "signal-slash", msg: lang.CALL_OFFLINE })
    }
  }
  run(type: string, data: IZender): void {
    if (!this[type]) return
    this[type](data)
  }
}
const processClient = new ProcessClient()
export default processClient
