import peerConfiguration from "../main/peerConfig"
import { PeerCallHandlerOptions, SignalData } from "../types/peer.types"

export class PeerCallHandler {
  private peerConnection: RTCPeerConnection
  private localStream?: MediaStream
  private remoteStream?: MediaStream
  private options: PeerCallHandlerOptions
  constructor(options: PeerCallHandlerOptions) {
    this.options = options
    this.peerConnection = new RTCPeerConnection(peerConfiguration)

    this.setupListeners()
  }
  private setupListeners(): void {
    this.peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        this.options.onSignal({ type: "candidate", candidate: e.candidate.toJSON() })
      }
    }

    this.peerConnection.ontrack = (e) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
        this.options.onStream?.(this.remoteStream)
      }
      this.remoteStream.addTrack(e.track)
    }

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState
      console.log(state)
      if (state === "disconnected" || state === "closed") {
        this.options.onDisconnected?.()
      } else if (state === "failed") {
        this.options.onConnectionFailed?.()
      }
    }
  }

  async call(stream: MediaStream): Promise<void> {
    this.localStream = stream
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream)
    })

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    this.options.onSignal({ type: "offer", sdp: offer })
  }

  async answer(stream: MediaStream, offer: RTCSessionDescriptionInit): Promise<void> {
    this.localStream = stream
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream)
    })

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    this.options.onSignal({ type: "answer", sdp: answer })
  }

  async handleSignal(data: SignalData): Promise<void> {
    if (data.type === "offer" || data.type === "answer") {
      if (!data.sdp) {
        console.error("Failed to get RTCSessionDescriptionInit", data.sdp)
        return
      }
      const desc = new RTCSessionDescription(data.sdp)
      await this.peerConnection.setRemoteDescription(desc)
    } else if (data.type === "candidate" && data.candidate) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
      } catch (e) {
        console.error("Failed to add ICE candidate:", e)
      }
    }
  }

  hangup(): void {
    this.peerConnection.getSenders().forEach((sender) => sender.track?.stop())
    this.peerConnection.close()
  }
  getRemoteStream(): MediaStream | undefined {
    return this.remoteStream
  }
}
