import { Renderer } from "marked"

export function ss(txt: string, n: number = 20, o: number = 0): string {
  return (txt.length > n ? txt.substring(o, n - 3) + "..." : txt).trim()
}

export function escapeHTML(txt: string): string {
  const p = document.createElement("p")
  p.textContent = txt
  return p.innerHTML
}

export function escapeWhiteSpace(txt: string): string {
  const transtxt = /(\s)(?=\s)/g
  return txt.replace(transtxt, "").trim()
}

export const renderer: Partial<Renderer> = {
  code({ text }) {
    return `<pre><code>${text}</code></pre>`
  },
  codespan({ text }) {
    return `<code>${text}</code>`
  },
  image({ href, title, text }) {
    let out = `<img src="${href}" alt="${text}" onerror="this.src='/assets/error.jpg'"`
    if (title) {
      out += ` title="${escapeHTML(title)}"`
    }
    out += "/>"
    return out
  }
}
