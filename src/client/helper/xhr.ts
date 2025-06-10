import { KiriminHttpResponse } from "../types/helper.types"

export default {
  request(method: string, url: string, s: object = {}, el?: boolean): Promise<KiriminHttpResponse> {
    return new Promise((resolve) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest()
      xhr.open(method, url)
      xhr.responseType = "json"
      xhr.setRequestHeader("Accept", "application/json")

      if (el)
        xhr.upload.onprogress = ({ loaded, total }) => {
          const elpr: HTMLElement | null = document.querySelector(".loading .box p")
          const progress: number = Math.floor((loaded / total) * 100)
          if (elpr) {
            const spanpr: HTMLElement = elpr?.querySelector("span") || document.createElement("span")
            elpr.append(spanpr)
            spanpr.innerHTML = " " + progress + "%"
          }
        }

      xhr.onload = () => {
        if (xhr.status >= 400) {
          resolve({ ok: false, code: xhr.status, msg: "ERROR", ...xhr.response })
        } else {
          resolve(xhr.response)
        }
      }
      xhr.onerror = () => {
        resolve({ ok: false, code: xhr.status, msg: "ERROR" })
      }

      if (method === "POST") {
        xhr.setRequestHeader("Content-Type", "application/json")
        xhr.send(JSON.stringify(s))
      } else {
        xhr.send()
      }
    })
  },
  async get(ref: string): Promise<KiriminHttpResponse> {
    return await this.request("GET", ref)
  },
  async post(ref: string, s: object | null = {}, el?: boolean): Promise<KiriminHttpResponse> {
    return await this.request("POST", ref, s, el)
  }
}
