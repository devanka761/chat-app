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

export default function highlighter(): void {
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
}
