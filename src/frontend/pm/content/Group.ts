import { eroot, kel, qutor } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import sdate from "../../helper/sdate"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import db from "../../manager/db"
import { IRoomDataF, IUserF } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"
import Chats from "../center/Chats"
import Member from "../parts/Member"

export default class Group implements PrimaryClass {
  public isLocked: boolean
  readonly role: string
  private group: IRoomDataF
  private users: IUserF[]
  private el: HTMLDivElement
  private wall: HTMLDivElement
  private btnImg?: HTMLDivElement | null
  private btnGname?: HTMLDivElement | null
  private btnDname?: HTMLDivElement | null
  private btnBio?: HTMLDivElement | null
  constructor(s: { group: IRoomDataF; users: IUserF[] }) {
    this.role = "group"
    this.isLocked = false
    this.group = s.group
    this.users = s.users
  }
  private createElement() {
    this.el = kel("div", "Account pmcontent")
    const top = kel("div", "top")
    top.innerHTML = `<div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div><div class="sect-title">${lang.APP_GROUP}</div>`

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)
  }
  private writeDetail(): void {
    this.renImage()
    this.renGroupId()
    this.renGname()
    this.renMembers()
    // this.renUserSignIn()
  }
  private btnListener(): void {
    this.imgListener()
    this.gnameListener()
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

    if (!this.btnImg && this.group.owner === db.me.id) {
      this.btnImg = kel("div", "btn btn-img", {
        e: `<i class="fa-solid fa-pen-to-square"></i></div>`
      })
      outer.append(this.btnImg)
    }
    if (outer.firstChild) outer.firstChild.remove()
    const img = new Image()
    img.onerror = () => (img.src = "/assets/group.jpg")
    img.src = this.group.image ? `/file/group/${this.group.image}` : "/assets/group.jpg"
    img.alt = this.group.short
    outer.prepend(img)
  }
  private renGroupId(): void {
    const chp = kel("div", "chp userid", {
      e: `<div class="outer"><div class="chp-t">ID</div><div class="chp-f"><p>${this.group.id}</p></div></div>`
    })
    this.wall.append(chp)
  }
  private renGname(): void {
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
      chpTitle = kel("div", "chp-t", { e: "Group Name" })
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
    p.innerText = this.group.short
    if (!this.btnGname && this.group.owner === db.me.id) {
      this.btnGname = kel("div", "chp-e btn-username", {
        e: `<i class="fa-solid fa-pen-to-square"></i> Edit`
      })
      outer.append(this.btnGname)
    }
    if (this.group.badges) setbadge(chpValue, this.group.badges)
  }
  private renMembers(): void {
    let chp = qutor(".chp.groupmember", this.wall)
    if (!chp) {
      chp = kel("div", "chp groupmember")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Members" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-u", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-u")
      outer.append(chpValue)
    }

    let ul = qutor("ul", chpValue)
    if (!ul) {
      ul = kel("ul")
      chpValue.append(ul)
    }

    this.users.forEach((usr) => {
      const member = new Member({ group: this.group, user: usr })
      member.run()
      if (member.isOwner) {
        ul.prepend(member.html)
      } else {
        ul.append(member.html)
      }
    })
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

          const setImg = await modal.loading(xhr.upload("/x/group/set-img", { img: imgsrc, name: file.name, id: this.group.id }, true), lang.UPLOADING)
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
          this.group.image = setImg.data.text
          const gdb = db.c.find((ch) => ch.r.id === this.group.id)
          if (gdb) gdb.r.image = this.group.image
          this.isLocked = false
          this.processUpdate()
          this.renImage()
        }
        inp.click()
      }
  }
  private processUpdate(): void {
    if (!userState.center || userState.center.role !== "chats") return
    const chatCenter = userState.center as Chats
    chatCenter.updateData(this.group)
  }
  private gnameListener(): void {
    if (this.btnGname)
      this.btnGname.onclick = async () => {
        if (this.isLocked === true) return
        this.isLocked = true
        const getUname = await modal.prompt({
          msg: lang.GRPS_DNAME,
          ic: "pencil",
          val: this.group.short,
          iregex: /(\s)(?=\s)/g,
          max: 35
        })
        if (!getUname) {
          this.isLocked = false
          return
        }
        if (getUname === this.group.short) {
          this.isLocked = false
          return
        }
        const setGname = await modal.loading(xhr.post("/x/group/set-groupname", { gname: getUname, id: this.group.id }))
        if (!setGname.ok) {
          await modal.alert(lang[setGname.msg].replace(/{TIMESTAMP}/, sdate.remain(setGname.data.timestamp)) || lang.ERROR)
          this.isLocked = false
          return
        }
        this.group.short = setGname.data.text
        const gdb = db.c.find((ch) => ch.r.id === this.group.id)
        if (gdb) gdb.r.short = this.group.short
        this.isLocked = false
        this.renGname()
        this.processUpdate()
      }
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
    eroot().append(this.el)
    this.writeDetail()
    this.btnListener()
  }
}
