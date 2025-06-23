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
    this.ws.onmessage = (msg) => {
      console.log("msg", msg.data)
    }
    this.ws.onopen = () => {
      if (this.ws)
        this.ws.send(
          JSON.stringify({
            type: "kirimin",
            payload: {
              testing: "berhasil gak?"
            }
          })
        )
    }
  }
  close(): void {
    if (this.ws) this.ws.close()
  }
  run(s: { id: string; host: string }): this {
    this.id = s.id
    this.host = s.host
    this.start()
    return this
  }
}

export default new SocketClient()
