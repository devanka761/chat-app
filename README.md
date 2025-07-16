# CHAT APP - Kirimin v3.0.0
- Live Demo: [Kirimin](https://kirimin.devanka.id/)
- Support Me: [Donasi Saweria](https://saweria.co/devanka)
- Subscribe: YouTube [Devanka 761](https://www.youtube.com/@devanka761)
## FITUR
1. Perpesanan pribadi, grup, dan global
2. Dapat mengirim pesan text, gambar, suara, dan file
3. Video Call &amp; Voice Call
4. Pertemanan untuk akses khusus pribadi
5. Untaian pada target balasan pesan
6. Profil pengguna yang berisi username, displayname, bio, foto profil
7. Postingan publik (layaknya instagram) beserta jumlah like dan komentar
8. Notifikasi In-App

## INSTALASI
### Via Fork/Clone
Install semua dependencies dengan **NPM**
```shell
npm install
```
### Via Download
1. Extract dan masuk ke dalam folder `chat-app-main`
2. Buka terminal dan arahkan ke dalam folder `chat-app-main` tersebut
3. Install semua dependencies dengan **NPM**
```shell
npm install
```

## KONFIGURASI .ENV
1. Buat file `.env` dan salin isi dari file `.env.example`
2. Modifikasi file `.env` sesuai dengan kebutuhan config kamu

## KONFIGURASI PUBLIC CONFIG & PEER CONFIG
- **SOON!**


## JALANKAN
### A. Development Mode
Buka 2 terminal atau 1 terminal dengan 2 tab
1. Watch Client Build
```shell
npm run dev:build
```
2. Watch Server Start
```shell
npm run dev:start
```
### B. Production Mode

#### Compile Client Bundle
```shell
npm run build
```
#### Start Server

##### B.1. Dengan NPM Script
```shell
npm run start
```
##### B.2. Dengan PM2 Script
```shell
pm2 start npm --name "my-chat-app" -- start && pm2 restart "my-chat-app" --max-memory-restart 8G
```
> Unit bisa dengan K (Kilobyte), M (Megabyte), G (Gigabyte)