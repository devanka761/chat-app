import { WebSocket } from "ws"
import { TRelay } from "../types/relay.types"

export class Relay {
  private clients: Map<string, TRelay>
  constructor() {
    this.clients = new Map<string, TRelay>()
  }
  add(id: string, socket: WebSocket): TRelay {
    const client: TRelay = { id: id, socket }
    this.clients.set(id, client)
    return client
  }
  get(id: string): TRelay | null {
    const client = this.clients.get(id)
    if (!client) return null
    return client
  }
  remove(id: string): boolean {
    const client = this.clients.get(id)
    if (!client) return false
    this.clients.delete(id)
    return true
  }
  get entries(): TRelay[] {
    const clients: TRelay[] = []
    this.clients.forEach((client) => clients.push(client))
    return clients
  }
}

export default new Relay()
