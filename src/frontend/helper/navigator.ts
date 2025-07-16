export async function copyToClipboard(plaintext: string): Promise<boolean> {
  return await navigator.clipboard
    .writeText(plaintext)
    .then(() => {
      return true
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

export function textHighlight(el: HTMLElement): void {
  const range = document.createRange()
  range.selectNode(el)
  window.getSelection()?.removeAllRanges()
  window.getSelection()?.addRange(range)
}

export function checkMedia(s: { audio?: boolean; video?: boolean }): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return resolve(false)
    navigator.mediaDevices
      .getUserMedia({ audio: s.audio || false, video: s.video || false })
      .then((stream) => {
        setTimeout(() => {
          for (const track of stream.getTracks()) {
            track.enabled = false
            track.stop()
            stream.removeTrack(track)
          }
        }, 250)
        return resolve(true)
      })
      .catch(() => {
        return resolve(false)
      })
  })
}
