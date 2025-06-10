import { KiriminHttpResponse, ModalAlert, ModalConfirm, ModalPrompt, ModalSelect } from "../types/helper.types"
import kelement from "./kelement"
import * as klang from "./lang"

const modal = {
  async waittime(ts: number = 500, tsa: number = 0): Promise<void> {
    const ms: number = ts - tsa || 0
    return new Promise((resolve) => setTimeout(resolve, ms))
  },
  async loading(newfunc: Promise<object | string | number | void>, msg: string = "LOADING"): Promise<KiriminHttpResponse> {
    const el = kelement("div", "loading", {
      e: kelement("div", "box", {
        e: [kelement("div", "spinner", { e: kelement("i", "fa-solid fa-circle-notch fa-spin") }), kelement("div", "msg", { e: kelement("p", null, { e: msg }) })]
      })
    })
    document.querySelector(".app")?.append(el)

    await this.waittime()

    return await newfunc
      .then(async (res) => {
        el.classList.add("out")
        await this.waittime(500, 5)
        el.remove()
        return res
      })
      .catch(async (err) => {
        el.classList.add("out")
        await this.waittime(500, 5)
        el.remove()
        return err
      })
  },
  element(): HTMLElement {
    return kelement("div", "modal")
  },
  async alert(options: object | string): Promise<boolean> {
    return new Promise((resolve) => {
      const lang = klang.lang

      const definedMsg: string | null = typeof options === "string" ? options : null

      const s: ModalAlert = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: definedMsg ? definedMsg : "",
          okx: lang.OK
        },
        typeof options === "string" ? {} : options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p>${typeof s === "string" ? s || "" : s.msg || ""}</p>
        </div>
        <div class="act">
          <button class="btn btn-ok">${lang.OK || "OK"}</button>
        </div>
      </div>`

      const btn = el.querySelector(".act .btn-ok")
      if (s.okx) btn.innerText = s.okx

      document.querySelector(".app")?.append(el)
      btn.focus()

      btn.onclick = async (): Promise<void> => {
        el.classList.add("out")
        await this.waittime(500, 5)
        el.remove()
        resolve(false)
        if (s.ok) s.ok()
        return
      }
    })
  },
  confirm(options: object | string): Promise<boolean> {
    return new Promise((resolve) => {
      const lang = klang.lang

      const definedMsg: string | null = typeof options === "string" ? options : null

      const s: ModalConfirm = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: definedMsg ? definedMsg : "",
          okx: lang.OK,
          cancelx: lang.CANCEL
        },
        typeof options === "string" ? {} : options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p>${typeof s === "string" ? s || "" : s.msg || ""}</p>
        </div>
        <div class="acts">
          <button class="btn btn-cancel">${lang.CANCEL || "CANCEL"}</button>
          <button class="btn btn-ok">${lang.OK || "OK"}</button>
        </div>
      </div>`

      if (s.img) {
        const img = new Image()
        img.src = s.img
        el.querySelector(".box .inf").append(img)
        img.onerror = async () => {
          el.classList.add("out")
          await this.waittime()
          el.remove()
          return resolve(await this.alert({ msg: lang.IMG_ERR, ic: "image-slash" }))
        }
      }
      const btnOk = el.querySelector(".acts .btn-ok")
      if (s.okx) btnOk.innerText = s.okx
      const btnCancel = el.querySelector(".acts .btn-cancel")
      if (s.cancelx) btnCancel.innerText = s.cancelx

      document.querySelector(".app")?.append(el)
      btnOk.focus()

      btnOk.onclick = async () => {
        el.classList.add("out")
        await this.waittime(500, 5)
        el.remove()
        resolve(true)
        if (s.ok) s.ok()
      }
      btnCancel.onclick = async () => {
        el.classList.add("out")
        await this.waittime(500, 5)
        el.remove()
        resolve(false)
        if (s.cancel) s.cancel()
      }
    })
  },
  prompt(options: object): Promise<string | null> {
    return new Promise((resolve) => {
      const lang = klang.lang
      const s: ModalPrompt = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: "",
          okx: lang.OK,
          cancelx: lang.CANCEL
        },
        options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p><label for="prompt-field">${typeof s === "string" ? s || "" : s.msg || ""}</label></p>
        </div>
        <div class="acts">
          <button class="btn btn-cancel">${lang.CANCEL || "CANCEL"}</button>
          <button class="btn btn-ok">${lang.OK || "OK"}</button>
        </div>
      </div>`

      const einf = el.querySelector(".inf")
      let inp: HTMLInputElement | HTMLTextAreaElement | null = null
      if (s.tarea) {
        inp = kelement("textarea")
        inp.maxLength = s.max ? s.max : 300
      } else {
        inp = kelement("input")
        inp.type = "text"
        inp.maxLength = s.max ? s.max : 100
        inp.autocomplete = "off"
      }
      inp.name = "prompt-field"
      inp.id = "prompt-field"
      inp.placeholder = s.pholder || lang.TYPE_HERE || "Type Here"
      if (s.iregex) {
        const tpRegex = s.iregex || ""
        inp.oninput = () => (inp.value = inp.value.replace(tpRegex, ""))
      }

      const btnOk = el.querySelector(".acts .btn-ok")
      if (s.okx) btnOk.innerText = s.okx
      const btnCancel = el.querySelector(".acts .btn-cancel")
      if (s.cancelx) btnCancel.innerText = s.cancelx

      einf.append(inp)
      document.querySelector(".app")?.append(el)
      inp.focus()
      if (s.val) inp.value = s.val

      btnOk.onclick = async () => {
        el.classList.add("out")
        await this.waittime()
        el.remove()
        resolve(inp.value)
        if (s.ok) s.ok()
      }
      btnCancel.onclick = async () => {
        el.classList.add("out")
        await this.waittime()
        el.remove()
        resolve(null)
        if (s.cancel) s.cancel()
      }
      inp.onkeydown = (e) => {
        if (e.key.toLowerCase() === "enter") {
          e.preventDefault()
          btnOk.click()
        }
      }
    })
  },
  select(options: object): Promise<string | null> {
    return new Promise((resolve) => {
      const lang = klang.lang

      const s: ModalSelect = Object.assign(
        {},
        {
          ic: "circle-exclamation",
          msg: "",
          okx: lang.OK,
          cancelx: lang.CANCEL,
          items: [
            { id: "not_a", label: "Please Add Option 1" },
            { id: "not_a", label: "Please Add Option 2" }
          ]
        },
        options
      )

      const el = this.element()
      el.innerHTML = `
      <div class="box">
        <div class="ic">
          <p><i class="fa-duotone fa-${s.ic ? s.ic : "circle-exclamation"}"></i></p>
        </div>
        <div class="inf">
          <p><label for="prompt-field">${typeof s === "string" ? s || "" : s.msg || ""}</label></p>
          <form class="modal-radio-form" id="modal-radio-form"></form>
        </div>
        <div class="acts">
          <button class="btn btn-cancel">${lang.CANCEL || "CANCEL"}</button>
          <button class="btn btn-ok">${lang.OK || "OK"}</button>
        </div>
      </div>`

      const form = el.querySelector(".box .inf #modal-radio-form")
      const optionId: string = Date.now().toString(36)
      s.items.forEach((itm) => {
        const radioInp = kelement("input", null, {
          a: {
            type: "radio",
            name: optionId,
            id: `${optionId}-${itm.id}`,
            value: itm.id,
            required: "true",
            checked: itm.activated ? "true" : false
          }
        })
        const radioLabel = kelement("label", null, {
          a: { for: `${optionId}-${itm.id}` },
          e: [radioInp, `<p>${itm.label}</p>`]
        })

        const radio = kelement("div", "radio", { e: radioLabel })
        form.append(radio)
      })

      const btnOk = el.querySelector(".acts .btn-ok")
      if (s.okx) btnOk.innerText = s.okx
      const btnCancel = el.querySelector(".acts .btn-cancel")
      if (s.cancelx) btnCancel.innerText = s.cancelx

      document.querySelector(".app")?.append(el)

      btnOk.onclick = async () => {
        let data: string | null = null
        const formData = new FormData(form)
        formData.forEach((val) => (data = val.toString()))
        el.classList.add("out")
        await this.waittime()
        el.remove()
        resolve(data)
        if (s.ok) s.ok()
      }
      btnCancel.onclick = async () => {
        el.classList.add("out")
        await this.waittime()
        el.remove()
        resolve(null)
        if (s.cancel) s.cancel()
      }
    })
  }
}
export default modal
