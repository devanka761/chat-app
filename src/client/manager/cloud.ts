// import { Peer } from "peerjs"
import { DataConnection, Peer } from "@devanka761/peerjs"
import { ForceCloseObject } from "../types/cloud.types"
import { PeerDB } from "../types/db.types"
import db from "./db"
import ForceClose from "../pages/ForceClose"
import ClientData from "./clientData"
import xhr from "../helper/xhr"

// let timesReconnect = 0
const connectedToPeer: { done: number; msg: string | null; interval: ReturnType<typeof setInterval> | null } = {
  done: 0,
  msg: null,
  interval: null
}
const peerError: ForceCloseObject = {
  msg_1: "",
  msg_2: "",
  action_text: null,
  action_url: null
}

let reqtimeout: ReturnType<typeof setTimeout> | null = null
const rtime = 10000

const mapPair = { i: 0, d: 0 }

// async function waittime(ms: number = 200): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }
// this.peer.socket._socket.send(JSON.stringify({selfadded: {data:"aaw"}}));
class cloud {
  public peer: Peer
  public peerid: string
  private pair: Map<string, DataConnection>
  private isStoped: number
  constructor() {
    this.pair = new Map()
    this.isStoped = 0
  }
  // processData(s, conn_peer_id) {
  //   if (!s.from || !s.id || !s.ts) return
  //   const peerConn = new PeerConn({ cloud: this, id: s.id, peer: conn_peer_id })
  //   peerConn.run(s)
  // }
  private listenTo() {
    this.peer.on("error", (err) => {
      if (err.type === "peer-unavailable") return
      if (err.type === "browser-incompatible") {
        connectedToPeer.done = 2
        peerError.msg_1 = "Your browser is incompatible"
        peerError.msg_2 = "Browser yang kamu gunakan tidak mendukung"
        peerError.action_text = "KEMBALI KE HOMEPAGE"
        peerError.action_url = "/"
        this.forceClose()
      } else {
        // this.reconnect()
      }
    })

    this.peer.on("connection", (conn) => {
      conn.on("open", () => {
        console.info("connected_a", conn.peer)
        this.pair.set(conn.peer, conn)
        // this.peer.socket._socket.send(JSON.stringify({ d761: { id: "getTalks" } }))
      })
      conn.on("close", () => {
        console.info("disconnected_a", conn.peer)
        this.pair.delete(conn.peer)
      })
      conn.on("error", () => {
        // console.info('error_a', conn.peer);
      })
      // conn.on("data", data => this.processData(data, conn.peer))

      window.addEventListener("unload", () => conn.close())
    })

    this.peer.once("open", () => {
      connectedToPeer.done = 1
      // console.log("opened")
      // ;(this.peer.socket as unknown as ExtendedSocket)._socket.send(JSON.stringify({ kirimin: { id: "testing" } }))
      // this.peer.socket._socket.send({ kirimin: { id: "testing" } })
      // this.peer.on("")
      this.peer.socket._socket?.addEventListener("message", (msg) => {
        if (msg.data) {
          if (reqtimeout) {
            clearTimeout(reqtimeout)
            reqtimeout = setTimeout(() => this.checkuser(), rtime)
          }
          const cloud_hb = JSON.parse(msg.data)
          if (cloud_hb.s) {
            Object.keys(cloud_hb.s).forEach((k) => {
              const clientData = new ClientData({ id: k })
              clientData.init(cloud_hb.s[k])
            })
          }
        }
      })
    })
  }
  private connectTo(id: string, currIndex: number, folFunc?: VoidFunction) {
    if (mapPair.d + 1 !== currIndex) return setTimeout(() => this.connectTo(id, currIndex, folFunc), 200)

    if (this.pair.has(id)) {
      mapPair.d++
      if (mapPair.d >= mapPair.i) {
        mapPair.i = 0
        mapPair.d = 0
      }
      if (folFunc) folFunc()
      return
    }
    const conn: DataConnection = this.peer.connect(id)

    conn.on("open", () => {
      console.info("connected_b", conn.peer)
      this.pair.set(conn.peer, conn)
      mapPair.d++
      if (mapPair.d >= mapPair.i) {
        mapPair.i = 0
        mapPair.d = 0
      }
      if (folFunc) folFunc()
    })
    conn.on("close", () => {
      console.info("disconnected_b", conn.peer)
      this.pair.delete(conn.peer)
    })
    conn.on("error", () => {
      // console.info('error_b', conn.peer);
    })

    // conn.on("data", data => this.processData(data, conn.peer))

    window.addEventListener("unload", () => conn.close())
  }
  async send({ id, to, data }: { id: string; to: string | string[]; data?: { [key: string]: string | number | boolean } }) {
    if (typeof to === "string") to = [to]
    for (const peer of to) {
      if (peer === this.peerid) return
      mapPair.i++
      if (this.pair.has(peer)) {
        this.pair.get(peer)?.send({ id, from: db.me.id, data, ts: Date.now() })
        mapPair.d++
        if (mapPair.d >= mapPair.i) {
          mapPair.i = 0
          mapPair.d = 0
        }
      } else {
        this.connectTo(peer, mapPair.i, () => {
          this.pair.get(peer)?.send({ id, from: db.me.id, data, ts: Date.now() })
        })
      }
    }
  }
  asend(id: string, data?: { [key: string]: string | number | boolean }) {
    this.peer.socket._socket?.send(JSON.stringify({ kirimin: { id, data } }))
  }
  // async reconnect() {
  //   if (playerState.pmc?.id === "bannerdrop") {
  //     playerState.pmc.latestRun = { id: "job_leave", user: db.char }
  //   } else if (playerState.journey && db.job.status !== 4) {
  //     if (playerState.pmc?.destroy) await playerState.pmc.destroy()
  //     playerState.journey.showUnfinished(-1, db.char)
  //   } else if (playerState.pmc?.id === "matchmaking") {
  //     playerState.pmc.resumeMap()
  //     playerState.pmc.destroy()
  //   } else if (playerState.pmc?.id === "prepare") {
  //     playerState.pmc.resumeMap()
  //     playerState.pmc.destroy()
  //   }
  //   reqtimeout = null
  //   this.peer.destroy()
  //   this.peer.disconnect()
  //   timesReconnect++
  //   if (timesReconnect >= 4) {
  //     connectedToPeer.done = 32
  //     peerError.msg_1 = "Connection Failed"
  //     peerError.msg_2 = "Koneksi Gagal"
  //     peerError.action_url = "/app"
  //     peerError.action_text = "RELOAD"
  //     return this.forceClose()
  //   }
  //   if (timesReconnect <= 1) notip({ ic: "plug-circle-xmark", a: "DISCONNECTED", c: "4" })
  //   if (timesReconnect <= 3) notip({ ic: "circle-notch fa-spin", a: `RECONNECTING ${timesReconnect}`, c: "2" })
  //   await waittime(7000)
  //   const reconnectUser = await xhr.get("/x/account/reconnect")
  //   if (reconnectUser?.code === 403423) {
  //     reqtimeout = null
  //     this.peer.destroy()
  //     this.peer.disconnect()
  //     await modal.alert({ msg: "You have been banned!", ic: "shield-halved" })
  //     connectedToPeer.done = 32
  //     peerError.msg_1 = "Your account has been suspended due to policy violations"
  //     peerError.msg_2 = "Akun kamu telah ditangguhkan karena pelanggaran kebijakan"
  //     peerError.action_url = "/x/auth/logout"
  //     peerError.action_text = "HOMEPAGE"
  //     return this.forceClose()
  //   }
  //   if (reconnectUser?.data?.version !== db.version) {
  //     reqtimeout = null
  //     this.peer.destroy()
  //     this.peer.disconnect()
  //     await modal.alert("Error: 426<br/>Client Version Mismatch")
  //     connectedToPeer.done = 32
  //     peerError.msg_1 = "Your game version is outdated. Please update to continue."
  //     peerError.msg_2 = "Versi game kamu perlu diperbarui untuk lanjut bermain."
  //     peerError.action_url = "/app?skipSplash=1"
  //     peerError.action_text = "UPDATE GAME"
  //     return this.forceClose()
  //   }
  //   if (!reconnectUser || reconnectUser.code !== 200) {
  //     if (timesReconnect < 4) return this.reconnect()
  //     peerError.msg_1 = "Connection Failed"
  //     peerError.msg_2 = "Koneksi Gagal"
  //     peerError.action_url = "/app"
  //     peerError.action_text = "RELOAD"
  //     return this.forceClose()
  //   }
  //   this.pair = new Map()
  //   this.isStopped = 0
  //   this.to = { cht: new Set() }
  //   const peerConn = await this.run(reconnectUser.data.peer)
  //   if (!peerConn || peerConn.done > 1) {
  //     peerError.msg_1 = "Connection Failed"
  //     peerError.msg_2 = "Koneksi Gagal"
  //     peerError.action_url = "/app"
  //     peerError.action_text = "RELOAD"
  //     return this.forceClose()
  //   }
  //   timesReconnect = 0
  //   notip({ ic: "plug-circle-check", a: "CONNECTED", c: "1" })
  // }
  private async checkuser() {
    const stillUser = await xhr.get("/x/auth/stillUser")
    if (stillUser && stillUser.data && stillUser.data.peer !== this.peerid) {
      if (reqtimeout) clearTimeout(reqtimeout)
      peerError.msg_1 = "You have logged in from another location"
      peerError.msg_2 = "Kamu baru saja login di lokasi yang berbeda"
      return this.forceClose()
    }
  }
  private async forceClose() {
    // if(!reqtimeout || this.isStopped) return;
    reqtimeout = null
    this.peer.destroy()
    this.peer.disconnect()
    new ForceClose(peerError).init()
  }
  async run(s: PeerDB) {
    return new Promise((resolve) => {
      const { peerid, peerConfig } = s
      this.peerid = peerid
      this.peer = new Peer(peerid, peerConfig)
      this.listenTo()
      connectedToPeer.interval = setInterval(() => {
        if (connectedToPeer.done >= 1) {
          if (connectedToPeer.done === 1) {
            reqtimeout = setTimeout(() => this.checkuser(), rtime)
          }
          if (connectedToPeer.interval) clearInterval(connectedToPeer.interval)
          connectedToPeer.interval = null
          resolve({ peerError, done: connectedToPeer.done })
        }
      }, 250)
    })
  }
}

export default new cloud()
