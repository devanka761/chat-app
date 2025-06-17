import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import sdate from "../../helper/sdate"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"

export default class Account implements PrimaryClass {
  public isLocked: boolean
  readonly id: string
  private el: HTMLDivElement
  private x: { [key: string]: HTMLElement }
  constructor() {
    this.id = "account"
    this.isLocked = false
    this.x = {}
  }
  private createElement() {
    this.el = kelement("div", "Account pmcontent")
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">${lang.APP_ACCOUNT}</div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
          <div class="btn btn-img"><i class="fa-solid fa-pen-to-square"></i></div>
        </div>
      </div>
      <div class="chp userid">
        <div class="outer">
          <div class="chp-t">ID</div>
          <div class="chp-f"><p>${db.me.id}</p></div>
        </div>
      </div>
      <div class="chp username">
        <div class="outer">
          <div class="chp-t">Username</div>
          <div class="chp-f"><p></p></div>
          <div class="chp-e btn-username"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp userdisplayname">
        <div class="outer">
          <div class="chp-t">Display Name</div>
          <div class="chp-f"><p></p></div>
          <div class="chp-e btn-displayname"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp userbio">
        <div class="outer">
          <div class="chp-t">About</div>
          <div class="chp-f"><p></p></div>
          <div class="chp-e btn-bio"><i class="fa-solid fa-pen-to-square"></i> Edit</div>
        </div>
      </div>
      <div class="chp useremail">
        <div class="outer">
          <div class="chp-t">Email</div>
          <div class="chp-f"></div>
          <div class="chp-n"><p>${lang.ACC_ONLY_YOU}</p></div>
        </div>
      </div>
      <div class="chp usersign">
        <p><a class="logout" href="/x/auth/logout"><i class="fa-light fa-triangle-exclamation"></i> LOG OUT</a></p>
      </div>
    </div>`
  }
  private writeDetail(): void {
    this.renImage()
    this.renUname()
    this.renDname()
    this.renBio()
    this.renEmails()
  }
  private btnListener(): void {
    const elogout = <HTMLAnchorElement>this.el.querySelector(".usersign a.logout")
    elogout.onclick = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const getLogout = await modal.confirm(lang.ACC_LOGOUT)
      if (!getLogout) {
        this.isLocked = false
        return
      }
      await modal.loading(xhr.get("/x/auth/logout"))
      this.isLocked = false
      window.location.href = "/x/auth/logout"
    }
    const btnUname = <HTMLDivElement>this.el.querySelector(".btn-username")
    btnUname.onclick = async () => {
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
      if (setUname?.code === 429) {
        await modal.alert(`${lang.ACC_FAIL_UNAME_COOLDOWN}<br/><b>${sdate.remain(<number>setUname.data?.timestamp)?.toLocaleString() || "0"}</b>`)
        this.isLocked = false
        return
      }
      if (setUname?.code !== 200) {
        await modal.alert(lang[setUname.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      db.me.username = <string>setUname.data?.text
      this.isLocked = false
      this.renUname()
    }

    const btnDname = <HTMLDivElement>this.el.querySelector(".btn-displayname")
    btnDname.onclick = async () => {
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
      if (setDname?.code === 429) {
        await modal.alert(`${lang.ACC_FAIL_DNAME_COOLDOWN}<br/><b>${sdate.remain(<number>setDname.data?.timestamp)?.toLocaleString() || "0"}</b>`)
        this.isLocked = false
        return
      }
      if (!setDname || setDname.code !== 200) {
        await modal.alert(lang[setDname.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      db.me.displayname = <string>setDname.data?.text
      this.isLocked = false
      this.renDname()
    }
    const btnBio = <HTMLDivElement>this.el.querySelector(".btn-bio")
    btnBio.onclick = async () => {
      if (this.isLocked === true) return
      this.isLocked = true
      const getBio = await modal.prompt({
        msg: lang.ACC_BIO,
        tarea: true,
        val: db.me.bio,
        ic: "book-open-cover",
        max: 220,
        iregex: /(\s)(?=\s)/g
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
      if (setBio?.code === 429) {
        await modal.alert(`${lang.ACC_FAIL_BIO_COOLDOWN}<br/><b>${sdate.remain(<number>setBio.data?.timestamp)?.toLocaleString() || "0"}</b>`)
        this.isLocked = false
        return
      }
      if (setBio?.code !== 200) {
        await modal.alert(lang[setBio.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      db.me.bio = <string>setBio.data?.text
      this.isLocked = false
      this.renBio()
    }
    const btnImg = <HTMLDivElement>this.el.querySelector(".btn-img")
    btnImg.onclick = () => {
      const inp = kelement("input", null, { a: { type: "file", accept: "image/*" } })
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
        const imgsrc = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            return resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })

        const setImg = await modal.loading(xhr.post("/x/account/set-img", { img: imgsrc, name: file.name }, true), lang.UPLOADING)
        if (setImg?.code === 413) {
          await modal.alert(lang.ACC_FILE_LIMIT.replace(/{SIZE}/g, "2.5MB"))
          this.isLocked = false
          return
        }
        if (setImg?.code !== 200) {
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
  private renImage(): void {
    const eimage = <HTMLDivElement>this.el.querySelector(".userphoto .outer-img")
    if (eimage.firstChild) eimage.firstChild.remove()
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = db.me.image ? `/file/user/${db.me.image}` : "/assets/user.jpg"
    img.alt = db.me.username ?? ""
    eimage.prepend(img)
  }
  private renUname(): void {
    const euname = <HTMLParagraphElement>this.el.querySelector(".username .outer .chp-f p")
    euname.innerHTML = <string>db.me.username
    if (db.me.badges) setbadge(euname, db.me.badges)
  }
  private renDname(): void {
    const edname = <HTMLParagraphElement>this.el.querySelector(".userdisplayname .outer .chp-f p")
    edname.innerText = <string>db.me.displayname
  }
  private renBio(): void {
    const ebio = <HTMLParagraphElement>this.el.querySelector(".userbio .outer .chp-f p")
    ebio.innerText = db.me.bio || lang.ACC_NOBIO
  }
  private renEmails(): void {
    const eemails = <HTMLParagraphElement>this.el.querySelector(".useremail .outer .chp-f")
    db.me.email?.forEach((sid) => {
      eemails.append(kelement("p", null, { e: `${sid.email} - ${sid.provider}` }))
    })
  }
  update(): void | Promise<void> {}
  async destroy(): Promise<void> {
    this.el.classList.add("out")
    await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.content = this
    this.createElement()
    culement.app().append(this.el)
    this.writeDetail()
    this.btnListener()
  }
}
