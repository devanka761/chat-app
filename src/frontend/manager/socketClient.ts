import { IZender } from "../../backend/types/validate.types"
import processClient from "../main/processClient"

export class SocketClient {
  ws?: WebSocket
  id?: string
  host?: string
  constructor() {}
  private start(): void {
    this.ws = new WebSocket(`ws//${this.host}?id=${this.id}`)

    this.ws.onerror = (err) => {
      console.log(err)
    }
    this.ws.onclose = () => {
      console.log("closed")
    }
    this.ws.onmessage = (data) => {
      try {
        const msg = JSON.parse(data.data.toString()) as IZender
        processClient.run(msg.type, msg)
      } catch (err) {
        console.error(err)
      }
    }
    this.ws.onopen = () => {
      // if (this.ws)
      //   this.ws.send(
      //     JSON.stringify({
      //       type: "kirimin",
      //       payload: {
      //         testing: "berhasil gak?"
      //       }
      //     })
      //   )
    }
  }
  close(): void {
    if (this.ws) this.ws.close()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(data: any): void {
    if (this.ws) this.ws.send(JSON.stringify({ ...data, identifier: "kirimin" }))
  }
  run(s: { id: string; host: string }): this {
    this.id = s.id
    this.host = s.host
    this.start()
    return this
  }
}

export default new SocketClient()
