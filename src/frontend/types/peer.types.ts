import { IUserF } from "./db.types"

export type SignalData = {
  type: "offer" | "answer" | "candidate"
  sdp?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
  callKey?: string
}

export interface ICallUpdateF extends SignalData {
  user: IUserF
  sdp: RTCSessionDescriptionInit
}

export type PeerCallHandlerOptions = {
  onSignal: (data: SignalData) => void
  onDisconnected?: () => void
  onConnectionFailed?: () => void
  onStream?: (stream: MediaStream) => void
  onMessage?: (message: string) => void
  onUnavailable?: () => void
}

export type TSocketMessageF = {
  [key: string]: string | number | boolean | null
}
