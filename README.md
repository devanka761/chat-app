# Chat App - Kirimin
- Live Demo: [Kirimin Messenger](https://kirimin.devanka.id/)
- Subscribe: YouTube [Devanka 761](https://www.youtube.com/@devanka761)
- Join Discord: [Codemate Resort](https://devanka.id/discord)

## FEATURES
1. Private, group, and global chats
2. Support for text, image, video, audio, and other documents
3. Video Call &amp; Voice Call
4. Friendlist for private call
5. Chat reply embed
6. User profile (username, displayname, bio, and profile picture)
7. Public posts
8. In-App Notifications
9. Web Push Notifications

## INSTALL
### Via Fork/Clone
Install all dependencies with **NPM**
```shell
npm install
```
### Via Download
1. Extract and change directory to `chat-app-main` folder
2. Open terminal and go to `chat-app-main` folder
3. Install all dependencies with **NPM**
```shell
npm install
```

## CONFIG: .ENV
1. Copy file `.env.example` to `.env`
2. Edit file `.env` based on your preferences

## CONFIG: PUBLIC
`src/config/public.config.json`
```javascript
{
  "GEN_AI_FEATURE": false,
  // Enable AI Chat feature (powered by Google Generative AI)
  // If true, edit GENAI_API_KEY inside `.env`

  "AI_MODEL": "gemini-2.5-pro",
  // Choose ai model only if GEN_AI_FEATURE is true
  // See All Models: https://ai.google.dev/gemini-api/docs/models

  "USE_OAUTH_GOOGLE": true,
  // Enable Google OAuth login method
  // If true, edit GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET inside `.env`

  "USE_OAUTH_GITHUB": false,
  // Enable GitHub OAuth login method
  // If true, edit GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET inside `.env`

  "USE_OAUTH_DISCORD": false,
  // Enable Discord OAuth login method
  // If true, edit DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET inside `.env`

  "SAVE_VERSION": "Kirimin20250726",
  // Sync users localstorage save version to the latest stable version. If outdated, old save file will be destroyed and generated a new one.
}
```

## CONFIG: SERVER
`src/config/server.config.json`
```javascript
{
  "webhook": false,
  // Send webhook about website log to discord
  // If true, (1) edit DISCORD_BOT_TOKEN inside `.env`, If true, (2) setup `src/config/discord.config.json`

  "update": false,
  // Update app version and force users to reload the page after server restart,

  "GenAIsystemInstruction": [
    "You are a friendly and helpful assistant.",
    "Ensure your answers are complete, unless the user requests a more concise approach."
  ]
  // System Instruction for AI Generation
}
```

## CONFIG: DISCORD WEBHOOK
`src/config/discord.config.json`
```javascript
{
  // if webhook is true, put your channel id from your discord server

  "AI_LEARN": "00000000000000",
  // monitor how ai answers to the user input

  "USER_LOG": "00000000000000"
  // monitor user log (online/offline)
}
```

## CONFIG: PEER
Edit `src/config/peer.config.json` with your **[RTCConfiguration](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection)**
> see example: `src/config/peer.example.config.json`

## RUN
### A. Development Mode
Open 2 terminals or 1 terminal with 2 tabs
1. Watch Client Build
```shell
npm run dev:build
```
2. Watch Server Start
```shell
npm run dev:start
```

### B. Production Mode

#### Bundle frontend sources and compile backend sources
```shell
npm run build
```
#### Start Server

##### B.1. With NPM Script
```shell
npm run start
```
##### B.2. With PM2 Script
```shell
pm2 start npm --name "my-chat-app" -- start && pm2 restart "my-chat-app" --max-memory-restart 8G
```
> [!TIP]
> Units can be K(ilobyte), M(egabyte), G(igabyte)