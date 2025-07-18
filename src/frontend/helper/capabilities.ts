export async function getVideoCapabilities(count: number): Promise<boolean> {
  if (count >= 1) {
    const capabilities = JSON.stringify(RTCRtpSender.getCapabilities("video")?.codecs || [])
    if (capabilities.toLowerCase().includes("video/vp8") || capabilities.toLowerCase().includes("video/h264")) {
      return true
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await getVideoCapabilities(count - 1)
    }
  } else {
    return false
  }
}
export async function getAudioCapabilities(count: number): Promise<boolean> {
  if (count >= 1) {
    const capabilities = JSON.stringify(RTCRtpSender.getCapabilities("audio")?.codecs || [])
    if (capabilities.toLowerCase().includes("audio/opus") || capabilities.toLowerCase().includes("audio/pcmu") || capabilities.toLowerCase().includes("audio/pcma")) {
      return true
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await getAudioCapabilities(count - 1)
    }
  } else {
    return false
  }
}
