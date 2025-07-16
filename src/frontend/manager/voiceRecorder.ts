type TVoiceRecorder = {
  media: MediaRecorder
  stream: MediaStream
}

export default function getVoiceRecorder(): Promise<TVoiceRecorder | null> {
  return new Promise((resolve) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const newRecorder = new MediaRecorder(stream, { audioBitsPerSecond: 128000 })
        resolve({ media: newRecorder, stream: stream })
      })
      .catch((err) => {
        console.log(err)
        resolve(null)
      })
  })
}
