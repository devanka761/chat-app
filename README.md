# CHAT APP - Kirimin v3.0.0
- Live Demo: [Kirimin](https://kirimin.devanka.id/)
- Support Me: [Donasi Saweria](https://saweria.co/devanka)
- Subscribe: YouTube [Devanka 761](https://www.youtube.com/@devanka761)
## FEATURES
1. Private, group, and global chats
2. Support for text, image, video, audio, and other documents
3. Video Call &amp; Voice Call
4. Friendlist for private call
5. Chat reply embed
6. User profile (username, displayname, bio, and profile picture)
7. Public posts
8. In-App Notifications

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

## CONFIG: SERVER
`src/config/server.config.json`
```javascript
{
  "webhook": false,
  // No effect - Not currently used

  "update": false,
  // Update app version and force users to reload the page after server restart
}
```

## CONFIG: PUBLIC
`src/config/public.config.json`
```javascript
{
  "USE_OAUTH_GOOGLE": true,
  // Enable Google OAuth login method. If true, edit the client id and client secret inside `.env`.

  "USE_OAUTH_GITHUB": true,
  // Enable GitHub OAuth login method. If true, edit the client id and client secret inside `.env`.

  "USE_OAUTH_DISCORD": true,
  // Enable Discord OAuth login method. If true, edit the client id and client secret inside `.env`.

  "SAVE_VERSION": "Kirimin20250620",
  // Sync users localstorage save version to the latest stable version. If outdated, old save file will be destroyed and generated a new one.
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
> [!NOTE]
> Units can be K(ilobyte), M(egabyte), G(igabyte)