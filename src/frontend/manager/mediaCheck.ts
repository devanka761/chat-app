const mediaExtension = {
  image: ["jpg", "jpeg", "png", "webp", "svg"],
  video: ["mp4", "3gp", "flv", "mov", "mkv"],
  audio: ["ogg", "mp3", "wav", "m4a"]
}

export default function mediaCheck(filename: string): keyof typeof mediaExtension | undefined {
  const fileFormat = /\.([a-zA-Z0-9]+)$/
  filename = filename.toLowerCase()
  const fileExt = filename.match(fileFormat)?.[1] || "unknown"
  const extension = Object.keys(mediaExtension).find(k => mediaExtension[k] && mediaExtension[k].find((key: string) => key === fileExt))
  if (extension) return extension as keyof typeof mediaExtension
  return undefined
}
