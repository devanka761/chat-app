import "./sass/home.scss"
import nav from "./helper/nav"
import Doodles from "./pm/props/chats/DoodlesAPI"

nav()

function removeHistory(): void {
  window.addEventListener(
    "scroll",
    () => {
      window.history.replaceState({}, "", window.location.pathname)
    },
    { once: true }
  )
}

function showPreview(): void {
  const eroot = document.getElementById("main")

  if (eroot) {
    new Doodles({
      root: eroot,
      fillRatio: 0.65,
      strength: 50
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains("show")) {
          entry.target.classList.add("show")
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 1 }
  )
  const elements = document.querySelectorAll(".chat-card")
  elements.forEach((el) => observer.observe(el))
}

let pwaInstaller: BeforeInstallPromptEvent | null = null
let PWA_READY: boolean = false

const btnInstall = document.getElementById("btn-install") as HTMLAnchorElement | null

function showInstallButton(): void {
  if (btnInstall) btnInstall.classList.remove("hide")
}
function hideInstallButton(): void {
  if (btnInstall) btnInstall.classList.add("hide")
}

function setPWA(): void {
  if (btnInstall)
    btnInstall.onclick = async (e) => {
      e.preventDefault()
      if (window.matchMedia("(display-node: standalone)").matches) {
        window.location.href = "/app"
      }

      if (PWA_READY) {
        window.location.href = "/app"
        return
      }

      if (pwaInstaller) {
        const confirm_install = await pwaInstaller.prompt()
        if (confirm_install.outcome === "accepted") {
          PWA_READY = true
        }
      }
    }

  window.addEventListener("appinstalled", () => {
    hideInstallButton()
  })

  window.addEventListener("beforeinstallprompt", (event: BeforeInstallPromptEvent) => {
    event.preventDefault()
    pwaInstaller = event

    if (window.matchMedia("(display-node: standalone)").matches) {
      PWA_READY = true
    }

    showInstallButton()
  })
}

function setOnResize(): void {
  window.addEventListener("resize", () => {
    if (PWA_READY) {
      hideInstallButton()
      window.location.href = "/app"
    }
  })
}

showPreview()
removeHistory()
setPWA()
setOnResize()
