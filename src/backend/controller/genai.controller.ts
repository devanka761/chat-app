import fs from "fs"
import { GEN_AI_FEATURE, AI_MODEL } from "../../config/public.config.json"
import { GenAIConfig } from "../../config/server.config.json"
import { KirAIRoom, KirAIUser } from "../../frontend/helper/AccountKirAI"
import { IMessageUpdateF } from "../../frontend/types/message.types"
import AIChats from "../main/aichats"
import cfg from "../main/cfg"
import zender from "../main/zender"
import { IRepTempB } from "../types/validate.types"
import { Content, GoogleGenAI } from "@google/genai"
import { getUser } from "./profile.controller"
import { AIChat, IMessageB, IMessageKeyB } from "../types/db.types"
import db from "../main/db"
import { minimizeMessage, normalizeMessage } from "../main/helper"
import { IMessageF, IRoomDataF, IUserF } from "../../frontend/types/db.types"
import webhookSender from "../main/webhook"

type FormatFromGlobal = {
  room: IRoomDataF
  users: IUserF[]
  chat_id: string
}

const ai = new GoogleGenAI({ apiKey: cfg.GENAI_API_KEY })

function removeModels(): void {
  const userModels = Object.keys(AIChats).filter((k) => Date.now() >= AIChats[k].ts && !db.ref.u[k].socket)

  if (userModels.length >= 1) {
    webhookSender.modelLog({ userids: userModels.map((model) => `Model ${model}`).join(", ") })
    userModels.forEach((k) => delete AIChats[k])
  }
}

export function startModelRemover(): void {
  setInterval(removeModels, 1000 * 60 * 60 * 2)
}

function getModel(uid: string): AIChat {
  const chatsdb = (db.fileGet(`ai${uid}`, "kirai") || {}) as IMessageKeyB
  const messages = Object.keys(chatsdb).map((msgkey) => {
    const rawData = chatsdb[msgkey]
    return normalizeMessage(msgkey, rawData)
  })

  const aihistory = transformChatToHistory(messages)

  if (!AIChats[uid]) {
    const model = ai.chats.create({
      model: AI_MODEL,
      history: aihistory,
      config: GenAIConfig
    })
    AIChats[uid] = {
      model,
      rate: 0,
      ts: 0
    }
  }

  return AIChats[uid]
}
function transformChatToHistory(messages: IMessageF[]): Content[] {
  return messages.map((msg) => {
    return {
      role: msg.id === KirAIUser.id ? "model" : "user",
      parts: [{ text: msg.text }]
    }
  })
}
async function GetAIAnswer(uid: string, user_text: string, aichat: AIChat, chat_id: string, gid: string, fmt?: FormatFromGlobal) {
  const aiAnswer = await aichat.model.sendMessage({
    message: user_text.trim()
  })
  AIChats[gid].rate++
  AIChats[gid].ts = Date.now() + 1000 * 60 * 10

  const ai_text = aiAnswer.text || "**KirAI** Error"

  const newchat: IMessageF = {
    userid: KirAIUser.id,
    reply: chat_id,
    id: "ai" + chat_id,
    type: "text",
    timestamp: Date.now(),
    text: ai_text
  }
  const data: IMessageUpdateF = {
    chat: newchat,
    roomdata: fmt?.room || KirAIRoom,
    users: fmt?.users || [KirAIUser, getUser(uid, uid)],
    sender: KirAIUser
  }

  const chatsdb = (db.fileGet(`ai${gid}`, "kirai") || {}) as IMessageKeyB

  const minimizedMessage = minimizeMessage(KirAIUser.id, newchat)

  chatsdb["ai" + chat_id] = minimizedMessage
  db.fileSet(`ai${gid}`, "kirai", chatsdb)

  if (fmt?.room.id === "696969") saveToGroup("ai" + chat_id, minimizedMessage)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const users = fmt && fmt.users ? fmt.users.map((usr) => usr.id) : [uid]
  users.forEach((usr) => {
    zender(KirAIUser.id, usr, "sendmessage", data)
  })

  webhookSender.genai({ userid: KirAIUser.id, chatid: chat_id, text: ai_text })
}

export function sendAIChat(uid: string, user_text?: string, fmt?: FormatFromGlobal): IRepTempB {
  if (!GEN_AI_FEATURE) return { code: 400 }
  const gid = fmt?.room.id || uid

  const myRate = AIChats[gid]
  if (myRate && myRate.rate >= 2) {
    if (myRate.ts >= Date.now()) {
      return { code: 404, msg: "AI_RATE_LIMIT", data: { ts: myRate.ts } }
    }
    AIChats[uid].rate = 0
  }

  if (!user_text || user_text.trim().length < 1) return { code: 400 }
  user_text = user_text.trim()

  const chat_id = fmt?.chat_id || "m" + Date.now().toString(36)

  const users: string[] = fmt && fmt.users ? fmt.users.map((usr) => usr.id) : [uid]

  const newchat = {
    userid: uid,
    id: chat_id,
    timestamp: Date.now(),
    text: user_text
  }
  const data: IMessageUpdateF = {
    chat: newchat,
    roomdata: fmt?.room || KirAIRoom,
    users: fmt?.users || [KirAIUser, getUser(uid, uid)]
  }
  const chatsdb = (db.fileGet(`ai${gid}`, "kirai") || {}) as IMessageKeyB

  chatsdb[chat_id] = minimizeMessage(uid, newchat)
  db.fileSet(`ai${gid}`, "kirai", chatsdb)
  webhookSender.genai({ userid: uid, chatid: chat_id, text: user_text })

  if (fmt) {
    setTimeout(() => {
      users.forEach((usr) => {
        zender(KirAIUser.id, usr, "sendmessage", {
          chat: {
            userid: KirAIUser.id,
            reply: chat_id,
            id: "ai" + chat_id,
            type: "think",
            timestamp: Date.now(),
            text: "⌛ ⌛ 🚀 🚀"
          },
          roomdata: fmt?.room || KirAIRoom,
          users: fmt?.users || [KirAIUser, getUser(usr, usr)],
          sender: KirAIUser
        })
      })
      GetAIAnswer(uid, user_text, getModel(gid), chat_id, gid, fmt)
    }, 1000)
  }

  return { code: 200, data }
}

export function clearAIChat(uid: string): IRepTempB {
  if (!GEN_AI_FEATURE) return { code: 400 }
  const chatpath = `./dist/db/kirai/ai${uid}.json`

  if (fs.existsSync(chatpath)) fs.writeFileSync(chatpath, JSON.stringify({}), "utf-8")
  if (AIChats[uid]) {
    AIChats[uid].model = ai.chats.create({
      model: AI_MODEL,
      history: [],
      config: GenAIConfig
    })
  }

  return { code: 200 }
}

export function isMentionedAI(room_id: string, text?: string): string | null {
  if (!text) return null
  if (room_id !== "696969") return null
  if (text.split(" ")[0].toLowerCase() === "@kirai") {
    return text.replace(/@kirai/i, "").trim()
  }
  return null
}

export function sendGlobalAI(uid: string, text: string, chat_id: string, room: IRoomDataF, users: IUserF[]): IRepTempB {
  return sendAIChat(uid, text, {
    room,
    users,
    chat_id
  })
}

function saveToGroup(chat_id: string, chat_message: IMessageB) {
  const dbold = db.fileGet("696969", "room") || {}
  dbold[chat_id] = chat_message
  db.fileSet("696969", "room", dbold)
}
