// import { KiriminHttpResponse } from "../types/helper.types"

import { IRepB, IReqType, SivalKeyType } from "../../backend/types/validate.types"

async function efetch(method: IReqType, url: string, s?: SivalKeyType): Promise<IRepB> {
  return await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: s ? JSON.stringify(s) : undefined
  })
    .then((res) => {
      return res.json()
    })
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log("error nih", err)
      return { code: 404, ok: false, msg: "ERROR" }
    })
}

function exmlrequest(method: IReqType, url: string, s?: SivalKeyType, el?: boolean): Promise<IRepB> {
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
}
export default {
  async get(ref: string): Promise<IRepB> {
    return await efetch("GET", ref)
  },
  async post(ref: string, s?: SivalKeyType): Promise<IRepB> {
    return await efetch("POST", ref, s)
  },
  async upload(ref: string, s?: SivalKeyType, el?: boolean): Promise<IRepB> {
    return await exmlrequest("POST", ref, s, el)
  }
}
