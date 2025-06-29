export default function getPeerStream(): Promise<MediaStream | null> {
  return new Promise((resolve) => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        resolve(stream)
      })
      .catch((err) => {
        console.log(err)
        resolve(null)
      })
  })
}
