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
import { AIChat } from "../types/db.types"
import { minimizeMessage, normalizeMessage } from "../main/helper"
import { IMessageF, IRoomDataF, IUserF } from "../../frontend/types/db.types"
import webhookSender from "../main/webhook"
import Message from "../models/Message.Model"
import { IMessage } from "../types/message.types"

type FormatFromGlobal = {
  room: IRoomDataF
  users: IUserF[]
  chat_id: string
}

const ai = new GoogleGenAI({ apiKey: cfg.GENAI_API_KEY })

function removeModels(): void {
  const userModels = Object.keys(AIChats).filter((k) => Date.now() >= AIChats[k].ts)

  if (userModels.length >= 1) {
    webhookSender.modelLog({ userids: userModels.map((model) => `Model ${model}`).join(", ") })
    userModels.forEach((k) => delete AIChats[k])
  }
}

export function startModelRemover(): void {
  setInterval(removeModels, 1000 * 60 * 60 * 2)
}

async function getModel(uid: string): Promise<AIChat> {
  const chatsdb = await Message.find({ roomId: `ai${uid}` }).lean()

  const messages = chatsdb.map((msg) => {
    return normalizeMessage(msg.id, msg.toJSON())
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
    users: fmt?.users || [KirAIUser, await getUser(uid, uid)],
    sender: KirAIUser
  }

  const minimizedMessage = minimizeMessage(KirAIUser.id, `ai${gid}`, `ai${chat_id}`, newchat)

  const message = new Message(minimizedMessage)
  await message.save()

  if (fmt?.room.id === "696969") saveToGroup("ai" + chat_id, minimizedMessage)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const users = fmt && fmt.users ? fmt.users.map((usr) => usr.id) : [uid]
  users.forEach((usr) => {
    zender(KirAIUser.id, usr, "sendmessage", data)
  })

  webhookSender.genai({ userid: KirAIUser.id, chatid: chat_id, text: ai_text })
}

export async function sendAIChat(uid: string, user_text?: string, fmt?: FormatFromGlobal): Promise<IRepTempB> {
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

  const newchat: IMessageF = {
    userid: uid,
    id: chat_id,
    timestamp: Date.now(),
    text: user_text
  }
  const data: IMessageUpdateF = {
    chat: newchat,
    roomdata: fmt?.room || KirAIRoom,
    users: fmt?.users || [KirAIUser, await getUser(uid, uid)]
  }
  const minimizedMessage = minimizeMessage(uid, `ai${gid}`, chat_id, newchat)

  const message = new Message(minimizedMessage)
  await message.save()

  webhookSender.genai({ userid: uid, chatid: chat_id, text: user_text })

  setTimeout(
    async () => {
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
      GetAIAnswer(uid, user_text, await getModel(gid), chat_id, gid, fmt)
    },
    fmt ? 1000 : 100
  )

  return { code: 200, data }
}

export async function clearAIChat(uid: string): Promise<IRepTempB> {
  if (!GEN_AI_FEATURE) return { code: 400 }
  await Message.deleteMany({ roomId: `ai${uid}` })

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

export async function sendGlobalAI(uid: string, text: string, chat_id: string, room: IRoomDataF, users: IUserF[]): Promise<IRepTempB> {
  return await sendAIChat(uid, text, {
    room,
    users,
    chat_id
  })
}

async function saveToGroup(chat_id: string, chat_message: IMessage): Promise<void> {
  const message = new Message({
    ...chat_message,
    roomId: chat_id
  })
  await message.save()
}
