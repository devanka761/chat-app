import modal from "./modal"

export default async function (el: HTMLElement): Promise<void> {
  el.classList.add("in")
  await modal.waittime()
  el.classList.remove("in")
}
