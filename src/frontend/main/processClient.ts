import { IZender } from "../../backend/types/validate.types"
import { escapeHTML } from "../helper/escaper"
import { lang } from "../helper/lang"
import notip from "../helper/notip"
import db from "../manager/db"
import Chats from "../pm/center/Chats"
import Friends from "../pm/center/Friends"
import Room from "../pm/content/Room"
import Tab from "../pm/header/Tab"
import Incoming from "../pm/media/Incoming"
import VoiceCall from "../pm/media/VoiceCall"
import { IRoomDataF, IUserF } from "../types/db.types"
import { IMessageUpdateF } from "../types/message.types"
import { ICallUpdateF } from "../types/peer.types"
import userState from "./userState"

class ProcessClient {
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
  unfriend(s: { user: IUserF }): void {
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
  acceptfriend(s: { user: IUserF }): void {
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
  cancelfriend(s: { user: IUserF }): void {
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
  sendmessage(s: IMessageUpdateF): void {
    let dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (!dbchat) {
      db.c.push({
        m: [],
        r: s.roomdata,
        u: s.users
      })
    }
    dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (dbchat) {
      const oldDB = dbchat.m.find((ch) => ch.id === s.chat.id)
      if (oldDB) {
        oldDB.text = s.chat.text
        oldDB.edited = s.chat.edited
      } else {
        dbchat.m.push(s.chat)
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
      if (roomdata) {
        chatcenter.update({
          chat: s.chat,
          users: roomdata.u,
          roomdata: roomdata.r
        })
      }
    }
  }
  editmessage(s: IMessageUpdateF): void {
    const dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
    if (dbchat) {
      const oldDB = dbchat.m.find((ch) => ch.id === s.chat.id)
      if (oldDB) {
        oldDB.text = s.chat.text
        oldDB.edited = s.chat.edited
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
  }
  deletemessage(s: IMessageUpdateF): void {
    const dbchat = db.c.find((k) => k.r.id === s.roomdata.id)
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
  }
  offer(s: ICallUpdateF) {
    const incoming = new Incoming({ data: s })
    incoming.run()
  }
  answer(s: ICallUpdateF) {
    if (!userState.media) return
    const voiceCall = userState.media as VoiceCall
    voiceCall.peer.handleSignal(s)
  }
  candidate(s: ICallUpdateF) {
    this.answer(s)
  }
  run(type: string, data: IZender): void {
    if (!this[type]) return
    this[type](data)
  }
}
const processClient = new ProcessClient()
export default processClient
