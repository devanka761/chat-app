import { IAccountB } from "../../backend/types/account.types"
import { IZender } from "../../backend/types/validate.types"
import { eroot, kel, qutor } from "../helper/kel"
import { lang } from "../helper/lang"
import modal from "../helper/modal"
import notip from "../helper/notip"
import xhr from "../helper/xhr"
import adap from "../main/adaptiveState"
import peerConfiguration from "../main/peerConfig"
import processClient from "../main/processClient"
import userState from "../main/userState"
import ForceClose from "../pages/ForceClose"
import db from "./db"

function socketError(err: Event) {
  console.error(err)
}
function socketMessage(data: MessageEvent) {
  try {
    const msg = JSON.parse(data.data.toString()) as IZender
    processClient.run(msg.type, msg)
  } catch (err) {
    console.error(err)
  }
}

export class SocketClient {
  ws?: WebSocket
  id?: string
  host?: string
  attemp: number
  private locker?: HTMLDivElement
  constructor() {
    this.attemp = 0
  }
  private start(): void {
    this.ws = new WebSocket(`ws${window.location.protocol === "https" ? "s" : ""}://${this.host}?id=${this.id}`)

    this.ws.addEventListener("error", socketError)
    this.ws.addEventListener("message", socketMessage)
    this.ws.addEventListener("close", () => this.onClosed(), { once: true })
  }
  destroy(): void {
    this.ws?.removeEventListener("error", socketError)
    this.ws?.removeEventListener("message", socketMessage)
  }
  async reconnect(): Promise<void> {
    this.lockAll()
    this.attemp++
    if (this.attemp >= 4) {
      new ForceClose({
        msg_1: '<i class="fa-duotone fa-solid fa-wifi-slash"></i>',
        msg_2: lang.CLOUD_TIMEOUT,
        action_url: "/app",
        action_text: "RELOAD"
      })
      return
    }
    if (this.attemp <= 1) {
      notip({ ic: "plug-circle-xmark", a: "DISCONNECTED", c: "4" })
      await modal.waittime(5000)
    }
    if (this.attemp <= 3) notip({ ic: "circle-notch fa-spin", a: `RECONNECTING #${this.attemp}`, c: "5" })

    const reconnectUser = await xhr.get("/x/auth/isUser")

    // if (!reconnectUser) return await this.reconnect()
    if (reconnectUser.data?.v && reconnectUser.data.v !== db.version) {
      await modal.waittime(4200)
      new ForceClose({
        msg_1: '<i class="fa-duotone fa-solid fa-sign-posts-wrench"></i>',
        msg_2: lang.CLOUD_OUTDATED,
        action_url: "/app",
        action_text: "UPDATE APP"
      })
      return
    }

    if (!reconnectUser.ok) {
      await modal.waittime(4200)
      return await this.reconnect()
    }
    this.run(reconnectUser.data)
    this.attemp = 0
    if (this.locker) this.locker.classList.add("getready")
    await modal.waittime(2200)
    if (userState.tab) userState.tab.update()
    if (userState.center) adap.swipe(userState.center, true)
    if (userState.content) adap.swipe(userState.content, true)
    await modal.waittime(1100)
    if (this.locker) {
      this.locker.classList.remove("getready")
      this.locker.classList.add("out")
    }
    await modal.waittime(1100)
    this.unlockAll()
    notip({ ic: "plug-circle-check", a: "CONNECTED", c: "1" })
  }
  private lockAll(): void {
    const approot = eroot()
    if (!this.locker) this.locker = kel("div", "locker")
    if (!approot.contains(this.locker)) approot.append(this.locker)
  }
  private unlockAll(): void {
    const approot = eroot()
    if (this.locker) {
      this.locker.classList.remove("out")
      if (approot.contains(this.locker)) approot.removeChild(this.locker)
      this.locker.remove()
    }
  }
  private async onClosed(): Promise<void> {
    this.ws = undefined
    qutor(".modal .btn-cancel")?.click()
    if (userState.media) userState.media.destroy()
    if (userState.incoming) userState.incoming.destroy()
    this.reconnect()
  }

  close(): void {
    if (this.ws) this.ws.close()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(data: any): void {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send(JSON.stringify({ ...data, identifier: "kirimin" }))
    }
  }
  init(s: IAccountB /*s: { id: string; host: string }*/): void {
    if (s.socket) {
      this.id = s.socket.id
      this.host = s.socket.host
    }
    if (s.me) db.me = s.me
    if (s.c) db.c = s.c
    if (s.v) db.version = s.v
    peerConfiguration.config = s.peer

    this.start()
  }
  run(s: IAccountB): this {
    this.init(s)
    return this
  }
}

export default new SocketClient()
