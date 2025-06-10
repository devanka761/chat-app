function waittime(ms = 495): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function openClose(nav: HTMLElement, btnNav: HTMLElement) {
  if (nav.classList.contains("opened")) {
    nav.classList.add("out")
    await waittime()
    btnNav.innerHTML = '<i class="fa-solid fa-bars"></i>'
    nav.classList.remove("opened")
  } else {
    nav.classList.add("out")
    await waittime()
    btnNav.innerHTML = '<i class="fa-solid fa-circle-x"></i>'
    nav.classList.add("opened")
  }
  nav.classList.remove("out")
}

export default function (): void {
  const isScrollable: NodeListOf<HTMLElement> = document.querySelectorAll("[scroll]")
  isScrollable.forEach((escroll) => {
    escroll.onclick = (e) => {
      e.preventDefault()
      const eView: string | null = escroll.getAttribute("href")?.replace("#", "") || null
      const eSection: HTMLElement | null = eView ? document.getElementById(eView) : null
      if (eSection) eSection.scrollIntoView()
    }
  })
  const nav: HTMLElement | null = document.querySelector(".nav")
  const btnNav: HTMLElement | null = nav?.querySelector(".btn-menu") || null
  if (nav && btnNav) btnNav.onclick = () => openClose(nav, btnNav)

  const bars: NodeListOf<HTMLElement> | undefined = nav?.querySelectorAll(".nav-list a")
  bars?.forEach((bar) => {
    const link: string | null = bar.getAttribute("href")
    const isRedirect: string | null = bar.getAttribute("data-r")
    const noOpen: string | null = bar.getAttribute("nopen")
    if (noOpen && nav && btnNav) {
      bar.addEventListener("click", (e): void => {
        e.preventDefault()
        openClose(nav, btnNav)
      })
      return
    }

    bar.onclick = async (e): Promise<void> => {
      e.preventDefault()
      if (isRedirect && nav && btnNav) {
        openClose(nav, btnNav)
        if (bar.getAttribute("target") && link) {
          window.open(link)
          return
        }
        if (link) window.location.href = link
        return
      } else {
        if (link) document.querySelector(link)?.scrollIntoView()
        if (nav && btnNav) openClose(nav, btnNav)
      }
    }
  })
}
