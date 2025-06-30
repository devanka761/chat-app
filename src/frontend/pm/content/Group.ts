import { epm, kel, qutor } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import sdate from "../../helper/sdate"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import adap from "../../main/adaptiveState"
import userState from "../../main/userState"
import db from "../../manager/db"
import { IRoomDataF, IUserF } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"
import Chats from "../center/Chats"
import Member from "../parts/Member"
import Empty from "./Empty"
import Room from "./Room"

export default class Group implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private group: IRoomDataF
  private users: IUserF[]
  private el: HTMLDivElement
  private wall: HTMLDivElement
  private btnImg?: HTMLDivElement | null
  private btnGname?: HTMLDivElement | null
  private btnInvite?: HTMLDivElement | null
  private btnLeave: HTMLAnchorElement
  private room?: Room
  private membersTitle?: HTMLDivElement | null
  private ul?: HTMLUListElement | null
  private btnBack: HTMLDivElement
  classBefore?: PrimaryClass
  constructor(s: { group: IRoomDataF; users: IUserF[]; room?: Room; classBefore?: PrimaryClass }) {
    this.king = "content"
    this.role = "group"
    this.isLocked = false
    this.group = s.group
    this.users = s.users
    this.room = s.room
    this.classBefore = s.classBefore
  }
  private createElement() {
    this.el = kel("div", "Account pmcontent")

    // this.btnBack = kel("div", "btn btn-back", { e: `<i class="fa-solid fa-arrow-left"></i>` })
    this.btnBack = kel("div", "btn btn-back")
    this.btnBack.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`
    const etitle = kel("div", "sect-title", { e: lang.APP_GROUP })
    const top = kel("div", "top", { e: [this.btnBack, etitle] })

    this.wall = kel("div", "wall")
    this.el.append(top, this.wall)
  }
  private writeDetail(): void {
    this.renImage()
    this.renGroupId()
    this.renGname()
    this.renInvite()
    this.renMembers()
    this.renLeave()
  }
  private btnListener(): void {
    this.btnBack.onclick = () => adap.swipe(this.classBefore)
    this.imgListener()
    this.gnameListener()
    this.inviteListener()
    this.leaveListener()
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
    const chp = kel("div", "chp groupid", {
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
      this.btnGname = kel("div", "chp-e btn-groupname", {
        e: `<i class="fa-solid fa-pen-to-square"></i> Edit`
      })
      outer.append(this.btnGname)
    }
    if (this.group.badges) setbadge(chpValue, this.group.badges)
  }
  private renInvite(): void {
    if (!this.group.link) return
    let chp = qutor(".chp.groupinvite", this.wall)
    if (!chp) {
      chp = kel("div", "chp groupinvite")
      this.wall.append(chp)
    }
    let outer = qutor(".outer", chp)
    if (!outer) {
      outer = kel("div", "outer")
      chp.append(outer)
    }

    let chpTitle = qutor(".chp-t", outer)
    if (!chpTitle) {
      chpTitle = kel("div", "chp-t", { e: "Group Invite Link" })
      outer.append(chpTitle)
    }

    let chpValue = qutor(".chp-f", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-f")
      outer.append(chpValue)
    }

    let a = qutor("a", chpValue) as HTMLAnchorElement | null
    if (!a) {
      a = kel("a", "btn")
      chpValue.append(a)
    }
    a.href = `/invite/${this.group.link}`
    a.innerHTML = `${window.location.origin}/invite/${this.group.link} <i class="fa-duotone fa-light fa-solid fa-copy"></i>`
    if (!this.btnInvite && this.group.owner === db.me.id) {
      this.btnInvite = kel("div", "chp-e btn-invite", {
        e: `<i class="fa-solid fa-rotate-right"></i> Reset`
      })
      outer.append(this.btnInvite)
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

    this.membersTitle = qutor(".chp-t", outer) as HTMLDivElement | null
    if (!this.membersTitle) {
      this.membersTitle = kel("div", "chp-t", { e: "Members" })
      outer.append(this.membersTitle)
    }
    this.renMemberTitle()

    let chpValue = qutor(".chp-u", outer)
    if (!chpValue) {
      chpValue = kel("div", "chp-u")
      outer.append(chpValue)
    }

    this.ul = qutor("ul", chpValue) as HTMLUListElement | null
    if (!this.ul) {
      this.ul = kel("ul")
      chpValue.append(this.ul)
    }

    this.users.forEach((usr) => this.renMemberNew(usr))
  }
  private renMemberTitle(): void {
    if (!this.membersTitle) return
    this.membersTitle.innerHTML = `Members ${this.users.length}/10`
  }
  private renMemberNew(usr: IUserF): void {
    const member = new Member({ group: this.group, user: usr, parent: this })
    member.run()
    if (!this.ul) return
    if (member.isOwner) {
      this.ul.prepend(member.html)
    } else {
      this.ul.append(member.html)
    }
  }
  private renLeave(): void {
    this.btnLeave = kel("a", "leave")
    this.btnLeave.href = "/x/group/leave"
    this.btnLeave.innerHTML = this.group.owner === db.me.id ? lang.GRPS_DELETE : lang.GRPS_LEAVE
    const p = kel("p", null, { e: this.btnLeave })
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
          if (this.room) this.room.data.image = this.group.image
        }
        inp.click()
      }
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
          await modal.alert(lang[setGname.msg]?.replace(/{TIMESTAMP}/, sdate.remain(setGname?.data?.timestamp)) || lang.ERROR)
          this.isLocked = false
          return
        }
        this.group.short = setGname.data.text
        const gdb = db.c.find((ch) => ch.r.id === this.group.id)
        if (gdb) gdb.r.short = this.group.short
        this.isLocked = false
        this.renGname()
        this.processUpdate()
        if (this.room) this.room.data.short = this.group.short
      }
  }
  private inviteListener(): void {
    if (this.btnInvite)
      this.btnInvite.onclick = async () => {
        if (this.isLocked === true) return
        this.isLocked = true
        const getReset = await modal.confirm({
          msg: lang.GRPS_RESET,
          ic: "rotate-right"
        })
        if (!getReset) {
          this.isLocked = false
          return
        }
        const setLink = await modal.loading(xhr.post("/x/group/reset-link", { id: this.group.id }))
        if (!setLink.ok) {
          await modal.alert(lang[setLink.msg])
          this.isLocked = false
          return
        }
        this.group.link = setLink.data.text
        const gdb = db.c.find((ch) => ch.r.id === this.group.id)
        if (gdb) gdb.r.link = this.group.link
        this.isLocked = false
        this.renInvite()
        this.processUpdate()
        if (this.room) this.room.data.link = this.group.link
      }
  }
  private leaveListener(): void {
    this.btnLeave.onclick = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const msg = this.group.owner === db.me.id ? "GRPS_DELETE_CONFIRM" : "GRPS_LEAVE_CONFIRM"
      const getLeave = await modal.confirm(lang[msg])
      if (!getLeave) {
        this.isLocked = false
        return
      }
      const setLeave = await modal.loading(xhr.post(`/x/group/leave/${this.group.id}`))
      if (!setLeave || !setLeave.ok) {
        await modal.alert(lang[setLeave.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      this.isLocked = false
      this.processDelete()
      adap.swipe(new Empty())
    }
  }
  private processUpdate(): void {
    if (!userState.center || userState.center.role !== "chats") return
    const chatCenter = userState.center as Chats
    chatCenter.updateData(this.group)
  }
  private processDelete(): void {
    const cdb = db.c.find((k) => k.r.id === this.group.id)
    if (cdb) db.c = db.c.filter((k) => k.r.id !== this.group.id)
    if (!userState.center || userState.center.role !== "chats") return
    const chatCenter = userState.center as Chats
    chatCenter.deleteData(this.group.id)
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
