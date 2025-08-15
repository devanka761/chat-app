import { Renderer } from "marked"
import hljs from "highlight.js/lib/core"
import c from "highlight.js/lib/languages/c"
import cpp from "highlight.js/lib/languages/cpp"
import csharp from "highlight.js/lib/languages/csharp"
import css from "highlight.js/lib/languages/css"
import go from "highlight.js/lib/languages/go"
import java from "highlight.js/lib/languages/java"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import markdown from "highlight.js/lib/languages/markdown"
import php from "highlight.js/lib/languages/php"
import python from "highlight.js/lib/languages/python"
import scss from "highlight.js/lib/languages/scss"
import sql from "highlight.js/lib/languages/sql"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"

hljs.registerLanguage("c", c)
hljs.registerLanguage("cpp", cpp)
hljs.registerLanguage("csharp", csharp)
hljs.registerLanguage("css", css)
hljs.registerLanguage("go", go)
hljs.registerLanguage("java", java)
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("json", json)
hljs.registerLanguage("markdown", markdown)
hljs.registerLanguage("php", php)
hljs.registerLanguage("python", python)
hljs.registerLanguage("scss", scss)
hljs.registerLanguage("ql", sql)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("xml", xml)

export function ss(txt: string, n: number = 20, o: number = 0): string {
  return (txt.length > n ? txt.substring(o, n - 3) + "..." : txt).trim()
}

export function escapeHTML(txt: string): string {
  const p = document.createElement("p")
  p.textContent = txt
  return p.innerHTML
}

export function escapeWhiteSpace(txt: string): string {
  return txt.replace(/\s{3,}/g, (match) => match.slice(0, 2)).trim()
}

export const renderer: Partial<Renderer> = {
  code({ text }) {
    return `<pre><code class="hljs">${hljs.highlightAuto(text).value}</code></pre>`
  },
  codespan({ text }) {
    return `<code class="hljs">${hljs.highlightAuto(text).value}</code>`
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
