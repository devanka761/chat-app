import dotenv from "dotenv"
dotenv.config()
import initialConfig from "../config/config"

const cfg: typeof initialConfig = {
  APP_PRODUCTION: process.env.APP_PRODUCTION === "true" ? true : false,
  APP_PORT: Number(process.env.APP_PORT),
  APP_HOST: process.env.APP_HOST as string,
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  CHAT_KEY: process.env.CHAT_KEY as string,
  TURN_HOST: process.env.TURN_HOST as string,
  TURN_PORT: process.env.TURN_PORT as string,
  TURN_USERNAME: process.env.TURN_USERNAME as string,
  TURN_PASSWORD: process.env.TURN_PASSWORD as string,
  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID as string,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string
}

Object.keys(initialConfig).forEach((k) => (cfg[k] = initialConfig[k]))

export default cfg
