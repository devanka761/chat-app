import { epm, kel, qutor } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import sdate from "../../helper/sdate"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import adap from "../../main/adaptiveState"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"

export default class Account implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  private wall: HTMLDivElement
  private btnImg?: HTMLDivElement | null
  private btnUname?: HTMLDivElement | null
  private btnDname?: HTMLDivElement | null
  private btnBio?: HTMLDivElement | null
  private btnLogout: HTMLAnchorElement
  private btnBack: HTMLDivElement
  classBefore?: PrimaryClass
  constructor(s?: { classBefore?: PrimaryClass }) {
    this.king = "content"
    this.role = "account"
    this.isLocked = false
    this.classBefore = s?.classBefore
  }
  private createElement() {
    this.el = kel("div", "Account pmcontent")
    this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    const etitle = kel("div", "sect-title", { e: lang.APP_ACCOUNT })
    const top = kel("div", "top", { e: [this.btnBack, etitle] })

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)
  }
  private writeDetail(): void {
    this.renImage()
    this.renUserId()
    this.renUname()
    this.renDname()
    this.renBio()
    this.renEmails()
    this.renUserSignIn()
  }
  private btnListener(): void {
    this.btnBack.onclick = () => {
      if (this.isLocked) return
      adap.swipe(this.classBefore)
    }
    this.imgListener()
    this.unameListener()
    this.dnameListener()
    this.bioListener()
    this.logoutListener()
  }
  private renImage(): void {
    let chp = qutor(".chp.userphoto", this.wall)
    if (!chp) {
      chp = kel("div", "chp userphoto")
      this.wall.append(chp)
    }
    let outer = qutor(".outer-img", chp)
    if (!outer) {
      outer = kel("div", "outer-img", { e: "<i></i>" })
      chp.append(outer)
    }

    if (!this.btnImg) {
      this.btnImg = kel("div", "btn btn-img", {
        e: `<i class="fa-solid fa-pen-to-square"></i></div>`
      })
      outer.append(this.btnImg)
    }
    if (outer.firstChild) outer.firstChild.remove()
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = db.me.image ? `/file/user/${db.me.image}` : "/assets/user.jpg"
    img.alt = db.me.username
    outer.prepend(img)
  }
  private renUserId(): void {
    const chp = kel("div", "chp userid", {
      e: `<div class="outer"><div class="chp-t">ID</div><div class="chp-f"><p>${db.me.id}</p></div></div>`
    })
    this.wall.append(chp)
  }
  private renUname(): void {
    let chp = qutor(".chp.username", this.wall)
    if (!chp) {
      chp = kel("div", "chp username")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Username" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    let p = qutor("p", chpValue)
    if (!p) {
      p = kel("p")
      chpValue.append(p)
    }
    p.innerText = db.me.username
    if (!this.btnUname) {
      this.btnUname = kel("div", "chp-e btn-username", {
        e: `<i class="fa-solid fa-pen-to-square"></i> Edit`
      })
      outer.append(this.btnUname)
    }
    if (db.me.badges) setbadge(p, db.me.badges)
  }
  private renDname(): void {
    let chp = qutor(".chp.userdisplayname", this.wall)
    if (!chp) {
      chp = kel("div", "chp userdisplayname")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Display Name" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }
    let p = qutor("p", chpValue)
    if (!p) {
      p = kel("p")
      chpValue.append(p)
    }
    p.innerText = db.me.displayname

    if (!this.btnDname) {
      this.btnDname = kel("div", "chp-e btn-displayname", {
        e: `<i class="fa-solid fa-pen-to-square"></i> Edit`
      })
      outer.append(this.btnDname)
    }
  }
  private renBio(): void {
    let chp = qutor(".chp.userbio", this.wall)
    if (!chp) {
      chp = kel("div", "chp userbio")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "About" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }
    let p = qutor("p", chpValue)
    if (!p) {
      p = kel("p")
      chpValue.append(p)
    }
    p.innerText = db.me.bio || lang.ACC_NOBIO

    if (!this.btnBio) {
      this.btnBio = kel("div", "chp-e btn-bio", {
        e: `<i class="fa-solid fa-pen-to-square"></i> Edit`
      })
      outer.append(this.btnBio)
    }
  }
  private renEmails(): void {
    const chpTitle = kel("div", "chp-t", { e: "Email" })
    const chpValue = kel("div", "chp-f")
    const chpHelp = kel("div", "chp-n", { e: `<p>${lang.ACC_ONLY_YOU}</p>` })
    const outer = kel("div", "outer", { e: [chpTitle, chpValue, chpHelp] })
    const chp = kel("div", "chp useremail", { e: outer })
    this.wall.append(chp)
    db.me.email?.forEach((sid) => {
      chpValue.append(kel("p", null, { e: `${sid.email} - ${sid.provider}` }))
    })
  }
  private renUserSignIn(): void {
    this.btnLogout = kel("a", "logout")
    this.btnLogout.href = "/logout"
    this.btnLogout.innerHTML = `LOG OUT`
    const p = kel("p", null, { e: this.btnLogout })
    const chp = kel("div", "chp usersign", { e: p })
    this.wall.append(chp)
  }
  private imgListener(): void {
    if (this.btnImg)
      this.btnImg.onclick = () => {
        const inp = kel("input", null, { a: { type: "file", accept: "image/*" } })
        inp.onchange = async () => {
          if (this.isLocked) return
          this.isLocked = true
          if (!inp.files || !inp.files[0]) {
            this.isLocked = false
            return
          }
          const file = inp.files[0]
          const tempsrc = URL.createObjectURL(file)
          const getImg = await modal.confirm({
            ic: "circle-question",
            msg: lang.ACC_IMG,
            img: tempsrc
          })
          if (!getImg) {
            this.isLocked = false
            return
          }
          const imgbuffer: string | undefined = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              return resolve(reader.result?.toString())
            }
            reader.readAsDataURL(file)
          })

          if (!imgbuffer) {
            await modal.alert({ ic: "image-slash", msg: lang.IMG_ERR })
            this.isLocked = false
            return
          }

          const imgsrc = imgbuffer

          const setImg = await modal.loading(xhr.upload("/x/account/set-img", { img: imgsrc, name: file.name }, true), lang.UPLOADING)
          if (setImg?.code === 413) {
            await modal.alert(lang.ACC_FILE_LIMIT.replace(/{SIZE}/g, "2.5MB"))
            this.isLocked = false
            return
          }
          if (!setImg || !setImg.ok) {
            await modal.alert(lang[setImg.msg] || lang.ERROR)
            this.isLocked = false
            return
          }
          db.me.image = <string>setImg.data?.text
          this.isLocked = false
          this.renImage()
        }
        inp.click()
      }
  }
  private unameListener(): void {
    if (this.btnUname)
      this.btnUname.onclick = async () => {
        if (this.isLocked === true) return
        this.isLocked = true
        const getUname = await modal.prompt({
          msg: lang.ACC_USERNAME,
          ic: "pencil",
          val: db.me.username,
          iregex: /\s/g,
          max: 20
        })
        if (!getUname) {
          this.isLocked = false
          return
        }
        if (getUname === db.me.username) {
          this.isLocked = false
          return
        }
        const setUname = await modal.loading(xhr.post("/x/account/set-username", { uname: getUname }))
        if (!setUname || !setUname.ok) {
          await modal.alert(lang[setUname.msg]?.replace(/{TIMESTAMP}/, sdate.remain(setUname?.data?.timestamp, true)) || lang.ERROR)
          this.isLocked = false
          return
        }
        db.me.username = <string>setUname.data?.text
        this.isLocked = false
        this.renUname()
      }
  }
  private dnameListener(): void {
    if (this.btnDname)
      this.btnDname.onclick = async () => {
        if (this.isLocked === true) return
        this.isLocked = true
        const getDname = await modal.prompt({
          ic: "marker",
          max: 45,
          msg: lang.ACC_DISPLAYNAME,
          val: db.me.displayname,
          iregex: /(\s)(?=\s)/g
        })
        if (!getDname) {
          this.isLocked = false
          return
        }
        if (getDname === db.me.displayname) {
          this.isLocked = false
          return
        }
        const setDname = await modal.loading(xhr.post("/x/account/set-displayname", { dname: getDname }))
        if (!setDname || !setDname.ok) {
          await modal.alert(lang[setDname.msg]?.replace(/{TIMESTAMP}/, sdate.remain(setDname?.data?.timestamp, true)) || lang.ERROR)
          this.isLocked = false
          return
        }
        db.me.displayname = <string>setDname.data?.text
        this.isLocked = false
        this.renDname()
      }
  }
  private bioListener(): void {
    if (this.btnBio)
      this.btnBio.onclick = async () => {
        if (this.isLocked === true) return
        this.isLocked = true
        const getBio = await modal.prompt({
          msg: lang.ACC_BIO,
          tarea: true,
          val: db.me.bio,
          ic: "book-open-cover",
          max: 220
          // iregex: /(\s)(?=\s)/g
        })
        if (!getBio) {
          this.isLocked = false
          return
        }
        if (getBio === db.me.bio) {
          this.isLocked = false
          return
        }
        const setBio = await modal.loading(xhr.post("/x/account/set-bio", { bio: getBio }))
        if (!setBio || !setBio.ok) {
          await modal.alert(lang[setBio.msg]?.replace(/{TIMESTAMP}/, sdate.remain(setBio?.data?.timestamp, true)) || lang.ERROR)
          this.isLocked = false
          return
        }
        db.me.bio = <string>setBio.data?.text
        this.isLocked = false
        this.renBio()
      }
  }
  private logoutListener(): void {
    this.btnLogout.onclick = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const getLogout = await modal.confirm(lang.ACC_LOGOUT)
      if (!getLogout) {
        this.isLocked = false
        return
      }
      window.localStorage.removeItem(userState.saveKey)
      await modal.loading(xhr.get("/x/auth/logout"))
      this.isLocked = false
      window.location.href = "/x/auth/logout"
    }
  }
  update(): void | Promise<void> {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    epm().append(this.el)
    this.writeDetail()
    this.btnListener()
  }
}
