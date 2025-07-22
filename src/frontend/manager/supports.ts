export function isUnifiedSupported(): boolean {
  if (typeof RTCPeerConnection === "undefined") return false
  if (typeof RTCRtpTransceiver === "undefined") return false
  if (typeof RTCRtpReceiver === "undefined") return false
  if (typeof WebSocket === "undefined") return false
  let tempPc: RTCPeerConnection | null = null
  let supported: boolean = true
  try {
    tempPc = new RTCPeerConnection()
    tempPc.addTransceiver("audio")
    supported = true
  } catch (_) {
    supported = false
  } finally {
    if (tempPc) {
      tempPc.close()
    }
  }
  return supported
}
