export function removeParams(...args: string[]): void {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  args.forEach((param) => {
    params.delete(param)
  })

  url.search = params.toString()
  window.history.pushState({}, "", url.toString())
}
