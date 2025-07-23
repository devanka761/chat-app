import dotenv from "dotenv"
dotenv.config()

const cfg = {
  APP_PRODUCTION: process.env.APP_PRODUCTION as string,
  APP_PORT: Number(process.env.APP_PORT) as number,
  APP_HOST: process.env.APP_HOST as string,
  SESSION_SECRET: process.env.SESSION_SECRET as string,
  CHAT_KEY: process.env.CHAT_KEY as string,
  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_PORT: Number(process.env.SMTP_PORT) as number,
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASS: process.env.SMTP_PASS as string,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID as string,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string
}
export default cfg
