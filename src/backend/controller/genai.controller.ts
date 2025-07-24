import { KirAIRoom, KirAIUser } from "../../frontend/helper/AccountKirAI"
import { IMessageUpdateF } from "../../frontend/types/message.types"
import AIChats from "../main/aichats"
import cfg from "../main/cfg"
import zender from "../main/zender"
import { IRepTempB } from "../types/validate.types"
import { Chat, GoogleGenAI } from "@google/genai"
import { getUser } from "./profile.controller"

const ai = new GoogleGenAI({ apiKey: cfg.GENAI_API_KEY })

function getModel(uid: string): Chat {
  if (!AIChats[uid]) {
    const model = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [],
      config: {
        maxOutputTokens: 500
      }
    })
    AIChats[uid] = model
  }

  return AIChats[uid]
}

async function GetAIAnswer(uid: string, user_text: string, model: Chat) {
  const aiAnswer = await model.sendMessage({
    message: user_text.trim(),
    config: {
      maxOutputTokens: 500
    }
  })
  const data: IMessageUpdateF = {
    chat: {
      userid: KirAIUser.id,
      id: "c" + Date.now().toString(36),
      timestamp: Date.now(),
      text: aiAnswer.text
    },
    roomdata: KirAIRoom,
    users: [KirAIUser, getUser(uid, uid)]
  }
  zender(KirAIUser.id, uid, "sendmessage", data)
}

export function sendAIChat(uid: string, user_text?: string): IRepTempB {
  if (!user_text || user_text.trim().length < 1) return { code: 400 }
  user_text = user_text.trim()

  GetAIAnswer(uid, user_text, getModel(uid))

  const data: IMessageUpdateF = {
    chat: {
      userid: uid,
      id: "c" + Date.now().toString(36),
      timestamp: Date.now(),
      text: user_text
    },
    roomdata: KirAIRoom,
    users: [KirAIUser, getUser(uid, uid)]
  }
  return { code: 200, data }
}
