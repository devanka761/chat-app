export default function getPeerStream(video: boolean): Promise<MediaStream | null> {
  return new Promise((resolve) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video })
      .then((stream) => {
        resolve(stream)
      })
      .catch((err) => {
        console.log(err)
        resolve(null)
      })
  })
}
