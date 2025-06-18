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
