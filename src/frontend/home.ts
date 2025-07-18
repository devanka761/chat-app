import "./sass/home.scss"
import nav from "./helper/nav"

nav()

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

setPWA()
setOnResize()
