import { IRepB, XHRData } from "../../interfaces/validate.interfaces"
import { XHRType } from "../../types/validate.types"

async function reqFetch(url: string, method: XHRType, s?: XHRData): Promise<IRepB> {
  return await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: s ? JSON.stringify(s) : null
  })
    .then((res) => {
      return res.json()
    })
    .then((res) => {
      console.log("response:", res)
      return res
    })
    .catch((err) => {
      console.error("ada error", err)
      return { ok: false, code: 400, msg: "ERROR" }
    })
}

function reqXML(url: string, s: XHRData, el?: boolean): Promise<IRepB> {
  return new Promise((resolve) => {
    const xhr: XMLHttpRequest = new XMLHttpRequest()
    xhr.open("POST", url)
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

    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(s))
  })
}

const xhr = {
  async get(ref: string): Promise<IRepB> {
    return await reqFetch(ref, "GET")
  },
  async post(ref: string, s?: XHRData): Promise<IRepB> {
    return await reqFetch(ref, "POST", s)
  },
  async upfile(ref: string, s: XHRData, el?: boolean): Promise<IRepB> {
    return await reqXML(ref, s, el)
  }
}

export default xhr
