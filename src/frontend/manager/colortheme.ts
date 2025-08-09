import { eroot, kel } from "../helper/kel"

export async function changeColorTheme(color: "dark" | "light"): Promise<void> {
  const themeChanger = kel("div", `themeChanger theme-${color}`)
  const newIcon = color === "light" ? "sun-bright" : "circle-moon"
  themeChanger.innerHTML = `<div class="changer-icon"><i class="fa-regular fa-${newIcon} fa-4x"></i></div>`
  eroot().append(themeChanger)
  await new Promise((resolve) => setTimeout(resolve, 1000))
  document.documentElement.setAttribute("data-theme", color)
  await new Promise((resolve) => setTimeout(resolve, 500))
  themeChanger.classList.add("out")
  await new Promise((resolve) => setTimeout(resolve, 1000))
  themeChanger.remove()
  await new Promise((resolve) => setTimeout(resolve, 100))
}
