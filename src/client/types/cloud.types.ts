export interface ForceCloseObject {
  msg_1: string
  msg_2: string
  action_text?: string | null
  action_url?: string | null
}

export interface ExtendedSocket {
  _socket: {
    send: (data: string) => void
    addEventListener: (type: "message", listener: (event: MessageEvent) => void) => void
  }
}

// const extendedSocket = peer.socket as ExtendedSocket;
// extendedSocket._socket.send(/* JSON */);
