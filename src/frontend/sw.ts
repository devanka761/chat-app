self.addEventListener("push", function (event) {
  // @ts-expect-error not in typescript by default
  const payload = event.data ? event.data.text() : "-"

  // @ts-expect-error not in typescript by default
  event.waitUntil(
    // @ts-expect-error not in typescript by default
    self.registration.showNotification("Kirimin Messenger", {
      body: payload
    })
  )
})
