import { webhook } from "../../config/server.config.json"
import { AI_LEARN, USER_LOG } from "../../config/discord.config.json"
import cfg from "./cfg"
import { KirAIUser } from "../../frontend/helper/AccountKirAI"
import logger from "./logger"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sendToDiscord(channel_id: string, message: any) {
  if (!webhook) return null
  fetch(`https://discord.com/api/channels/${channel_id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${cfg.DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  }).catch((err) => {
    logger.error(err)
  })
}

const colors = { blurple: 5793265, red: 16739950, lime: 7130225, yellow: 13283420, fuchsia: 15418781, cyan: 65535 }

const webhookSender = {
  genai(s: { userid: string; text: string; chatid: string }) {
    if (s.userid === KirAIUser.id) {
      sendToDiscord(AI_LEARN, { content: `**Answer to #${s.chatid}**\n${s.text}` })
    } else {
      sendToDiscord(AI_LEARN, {
        embeds: [
          {
            title: `#${s.chatid}`,
            description: `User${s.userid}: ${s.text}`,
            color: colors.blurple
          }
        ]
      })
    }
  },
  userLog(s: { userid: string; online?: boolean }) {
    sendToDiscord(USER_LOG, {
      embeds: [
        {
          description: `user **${s.userid}** ${s.online ? "online" : "offline"}`,
          color: colors[s.online ? "lime" : "red"]
        }
      ]
    })
  },
  modelLog(s: { userids: string }) {
    sendToDiscord(USER_LOG, {
      embeds: [
        {
          description: `model **\`${s.userids}\`** destroyed`,
          color: colors.yellow
        }
      ]
    })
  }
}
export default webhookSender
