import xhr from "../helper/xhr"

async function RegisterSW(): Promise<ServiceWorkerRegistration | null> {
  return await navigator.serviceWorker
    .register("/bundle/sw.js")
    .then((res) => res)
    .catch((err) => {
      console.error(err)
      return null
    })
}

export async function SetNotifications(publicKey: string): Promise<void> {
  const swRegisterer = await RegisterSW()
  if (!swRegisterer) return
  navigator.serviceWorker.ready
    .then((registration: ServiceWorkerRegistration) => {
      return registration.pushManager.getSubscription().then((subscription) => {
        if (subscription) return subscription
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        })
      })
    })
    .then(async (subscription) => {
      const sendSubscribe = await xhr.post("/x/account/subscribe", { subscription })
      console.log(sendSubscribe)
    })
    .catch((err) => {
      console.error(err)
    })
}
