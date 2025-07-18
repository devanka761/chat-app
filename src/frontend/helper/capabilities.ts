export async function getVideoCapabilities(count: number): Promise<boolean> {
  if (count >= 1) {
    console.log("Getting video codec capabilities")
    const capabilities = JSON.stringify(RTCRtpSender.getCapabilities("video")?.codecs || [])
    console.log(capabilities)
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
    console.log("Getting audio codec capabilities")
    const capabilities = JSON.stringify(RTCRtpSender.getCapabilities("audio")?.codecs || [])
    console.log(capabilities)
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
