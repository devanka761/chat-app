import { checkPushNotification } from "../helper/navigator"
import xhr from "../helper/xhr"

async function RegisterSW(): Promise<ServiceWorkerRegistration | null> {
  return await navigator.serviceWorker
    .register("/sw.js")
    .then((res) => res)
    .catch((err) => {
      console.error(err)
      return null
    })
}

export async function InitializeNotification(publicKey: string): Promise<void> {
  const checkPerm = await checkPushNotification()
  if (!checkPerm) return
  const swRegisterer = await RegisterSW()
  if (!swRegisterer) return
  const sw = await navigator.serviceWorker.ready
  const push = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey
  })
  await xhr.post("/x/account/subscribe", { subscription: push })
}

export function SetNotifications(publicKey: string): void {
  window.addEventListener("click", () => InitializeNotification(publicKey), { once: true })
}
