import { KirAIRoom, KirAIUser } from "../../frontend/helper/AccountKirAI"
import { IMessageUpdateF } from "../../frontend/types/message.types"
import AIChats from "../main/aichats"
import cfg from "../main/cfg"
import zender from "../main/zender"
import { IRepTempB } from "../types/validate.types"
import { Chat, Content, GoogleGenAI } from "@google/genai"
import { getUser } from "./profile.controller"
import { IMessageKeyB } from "../types/db.types"
import db from "../main/db"
import { minimizeMessage, normalizeMessage } from "../main/helper"
import { IMessageF } from "../../frontend/types/db.types"

const ai = new GoogleGenAI({ apiKey: cfg.GENAI_API_KEY })

function getModel(uid: string): Chat {
  const chatsdb = (db.fileGet(`ai${uid}`, "kirai") || {}) as IMessageKeyB
  const messages = Object.keys(chatsdb).map((msgkey) => {
    const rawData = chatsdb[msgkey]
    return normalizeMessage(msgkey, rawData)
  })

  const aihistory = transformChatToHistory(messages)

  if (!AIChats[uid]) {
    const model = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: aihistory,
      config: {
        systemInstruction: "Your name is KirAI and answer as concisely as possible"
      }
    })
    AIChats[uid] = model
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
async function GetAIAnswer(uid: string, user_text: string, model: Chat) {
  const aiAnswer = await model.sendMessage({
    message: user_text.trim(),
    config: {
      systemInstruction: "Your name is KirAI and answer as concisely as possible."
    }
  })

  const chat_id = "m" + Date.now().toString(36)
  const newchat = {
    userid: KirAIUser.id,
    id: chat_id,
    timestamp: Date.now(),
    text: aiAnswer.text
  }
  const data: IMessageUpdateF = {
    chat: newchat,
    roomdata: KirAIRoom,
    users: [KirAIUser, getUser(uid, uid)]
  }
  zender(KirAIUser.id, uid, "sendmessage", data)

  const chatsdb = (db.fileGet(`ai${uid}`, "kirai") || {}) as IMessageKeyB

  chatsdb[chat_id] = minimizeMessage(KirAIUser.id, newchat)
  db.fileSet(`ai${uid}`, "kirai", chatsdb)
}

export function sendAIChat(uid: string, user_text?: string): IRepTempB {
  if (!user_text || user_text.trim().length < 1) return { code: 400 }
  user_text = user_text.trim()

  GetAIAnswer(uid, user_text, getModel(uid))

  const chat_id = "m" + Date.now().toString(36)
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
  return { code: 200, data }
}
