import { getAudioCapabilities } from "../helper/capabilities"
import peerConfiguration from "../main/peerConfig"
import { PeerCallHandlerOptions, SignalData } from "../types/peer.types"

export class PeerCallHandler {
  private peerConnection: RTCPeerConnection
  private localStream?: MediaStream
  private remoteStream?: MediaStream
  private options: PeerCallHandlerOptions
  private dataChannel?: RTCDataChannel
  constructor(options: PeerCallHandlerOptions) {
    this.options = options
    this.peerConnection = new RTCPeerConnection(peerConfiguration.config || undefined)

    this.setupListeners()
  }
  private setupListeners(): void {
    this.peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        this.options.onSignal({ type: "candidate", candidate: e.candidate })
      }
    }

    this.peerConnection.ontrack = (e) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
        this.options.onStream?.(this.remoteStream)
      }
      this.remoteStream.addTrack(e.track)
    }

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState
      if (state === "closed" || state === "disconnected" || state === "failed") {
        this.options.onUnavailable?.()
      }
    }

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState
      if (state === "disconnected" || state === "closed") {
        this.options.onDisconnected?.()
      } else if (state === "failed") {
        this.options.onConnectionFailed?.()
      }
    }

    this.peerConnection.ondatachannel = (e) => {
      this.dataChannel = e.channel
      this.setupDataChannelEvents(this.dataChannel)
    }
  }

  private setupDataChannelEvents(channel: RTCDataChannel): void {
    channel.onopen = () => {}
    channel.onerror = () => {}
    channel.onclose = () => {}
    channel.onmessage = (e) => {
      try {
        this.options.onMessage?.(e.data.toString())
      } catch (err) {
        console.warn("Message is not valid " + e.data, err)
      }
    }
  }

  call(stream: MediaStream): void {
    this.localStream = stream
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream)
    })

    this.dataChannel = this.peerConnection.createDataChannel("control")
    this.setupDataChannelEvents(this.dataChannel)

    this.peerConnection.onnegotiationneeded = async () => {
      await getAudioCapabilities(20)
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      this.options.onSignal({ type: "offer", sdp: this.peerConnection.localDescription })
    }
  }

  async answer(stream: MediaStream, offer: RTCSessionDescriptionInit, callKey?: string): Promise<void> {
    this.localStream = stream
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream)
    })

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    this.options.onSignal({ type: "answer", sdp: this.peerConnection.localDescription, callKey: callKey })
  }

  async handleSignal(data: SignalData): Promise<void> {
    if (this.peerConnection.signalingState === "closed") {
      this.hangup()
      return
    }
    if (data.type === "answer") {
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
        // this.hangup()
        console.error("Failed to add ICE candidate:", e)
      }
    }
  }

  hangup(): void {
    this.peerConnection.getSenders().forEach((sender) => sender.track?.stop())
    this.peerConnection.close()
  }

  send(message: string) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(message)
    }
  }

  getRemoteStream(): MediaStream | undefined {
    return this.remoteStream
  }
}
