import dotenv from "dotenv"
dotenv.config()
import overRideData from "../config/config"
type PossibleData = {
  [key: string]: string | number | boolean | null | undefined
}
const cfg: PossibleData = {
  APP_PRODUCTION: process.env.APP_PRODUCTION,
  APP_PORT: Number(process.env.APP_PORT),
  APP_HOST: process.env.APP_HOST,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CHAT_KEY: process.env.CHAT_KEY,
  TURN_HOST: process.env.TURN_HOST,
  TURN_PORT: process.env.TURN_PORT,
  TURN_USERNAME: process.env.TURN_USERNAME,
  TURN_PASSWORD: process.env.TURN_PASSWORD,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
}
const toOverRide: PossibleData = overRideData
Object.keys(toOverRide).forEach(k => {
  cfg[k] = toOverRide[k]
})
export default cfg
