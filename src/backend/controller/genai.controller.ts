import fs from "fs"
import { GEN_AI_FEATURE, AI_MODEL } from "../../config/public.config.json"
import { KirAIRoom, KirAIUser } from "../../frontend/helper/AccountKirAI"
import { IMessageUpdateF } from "../../frontend/types/message.types"
import AIChats from "../main/aichats"
import cfg from "../main/cfg"
import zender from "../main/zender"
import { IRepTempB } from "../types/validate.types"
import { Content, GoogleGenAI } from "@google/genai"
import { getUser } from "./profile.controller"
import { AIChat, IMessageKeyB } from "../types/db.types"
import db from "../main/db"
import { minimizeMessage, normalizeMessage } from "../main/helper"
import { IMessageF } from "../../frontend/types/db.types"
import webhookSender from "../main/webhook"

const ai = new GoogleGenAI({ apiKey: cfg.GENAI_API_KEY })

function removeModels(): void {
  const userModels = Object.keys(AIChats).filter((k) => Date.now() >= AIChats[k].ts && !db.ref.u[k].socket)

  if (userModels.length >= 1) {
    webhookSender.modelLog({ userids: userModels.join(", ") })
    userModels.forEach((k) => delete AIChats[k])
  }
}

export function startModelRemover(): void {
  setInterval(removeModels, 1000 * 60 * 60 * 3)
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
      config: {
        systemInstruction: ["From now, your name is KirAI", "Answer as concisely as possible", "Website user and you are currently on is named Kirimin and you only know about the website documentation is at https://github.com/devanka761/chat-app"]
      }
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
async function GetAIAnswer(uid: string, user_text: string, aichat: AIChat, chat_id: string) {
  const aiAnswer = await aichat.model.sendMessage({
    message: user_text.trim(),
    config: {
      systemInstruction: ["From now, your name is KirAI", "Answer as concisely as possible", "Website user and you are currently on is named Kirimin and you only know about the website documentation is at https://github.com/devanka761/chat-app"]
    }
  })
  AIChats[uid].rate++
  AIChats[uid].ts = Date.now() + 1000 * 60 * 60 * 2

  const ai_text = aiAnswer.text || "**KirAI** Error"

  const newchat: IMessageF = {
    userid: KirAIUser.id,
    reply: chat_id,
    id: "ai" + chat_id,
    timestamp: Date.now(),
    text: ai_text
  }
  const data: IMessageUpdateF = {
    chat: newchat,
    roomdata: KirAIRoom,
    users: [KirAIUser, getUser(uid, uid)]
  }

  zender(KirAIUser.id, uid, "sendmessage", data)
  webhookSender.genai({ userid: KirAIUser.id, chatid: chat_id, text: ai_text })
  const chatsdb = (db.fileGet(`ai${uid}`, "kirai") || {}) as IMessageKeyB

  chatsdb["ai" + chat_id] = minimizeMessage(KirAIUser.id, newchat)
  db.fileSet(`ai${uid}`, "kirai", chatsdb)
}

export function sendAIChat(uid: string, user_text?: string): IRepTempB {
  if (!GEN_AI_FEATURE) return { code: 400 }
  const myRate = AIChats[uid]
  if (myRate && myRate.rate >= 2) {
    if (myRate.ts >= Date.now()) {
      return { code: 404, msg: "AI_RATE_LIMIT", data: { ts: myRate.ts } }
    }
    AIChats[uid].rate = 0
  }

  if (!user_text || user_text.trim().length < 1) return { code: 400 }
  user_text = user_text.trim()

  const chat_id = "m" + Date.now().toString(36)

  zender(KirAIUser.id, uid, "sendmessage", {
    chat: {
      userid: KirAIUser.id,
      reply: chat_id,
      id: "ai" + chat_id,
      timestamp: Date.now(),
      text: "⌛ ⌛ 🚀 🚀"
    },
    roomdata: KirAIRoom,
    users: [KirAIUser, getUser(uid, uid)]
  })

  const newchat = {
    userid: uid,
    id: chat_id,
    timestamp: Date.now(),
    text: user_text
  }
  const data: IMessageUpdateF = {
    chat: newchat,
    roomdata: KirAIRoom,
    users: [KirAIUser, getUser(uid, uid)]
  }
  const chatsdb = (db.fileGet(`ai${uid}`, "kirai") || {}) as IMessageKeyB

  chatsdb[chat_id] = minimizeMessage(uid, newchat)
  db.fileSet(`ai${uid}`, "kirai", chatsdb)
  webhookSender.genai({ userid: uid, chatid: chat_id, text: user_text })
  GetAIAnswer(uid, user_text, getModel(uid), chat_id)

  return { code: 200, data }
}

export function clearAIChat(uid: string): IRepTempB {
  if (!GEN_AI_FEATURE) return { code: 400 }
  const chatpath = `./dist/db/kirai/ai${uid}.json`

  if (fs.existsSync(chatpath)) fs.rmSync(chatpath)
  if (AIChats[uid]) delete AIChats[uid]

  return { code: 200 }
}
