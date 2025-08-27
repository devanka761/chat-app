import waittime from "./waittime"

export default async function (el: HTMLElement): Promise<void> {
  el.classList.add("in")
  await waittime()
  el.classList.remove("in")
}
