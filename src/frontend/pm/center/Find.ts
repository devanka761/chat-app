import culement from "../../helper/culement"
import { escapeHTML, ss } from "../../helper/escaper"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import notip from "../../helper/notip"
import setbadge from "../../helper/setbadge"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import resetform from "../../manager/resetform"
import swiper from "../../manager/swiper"
import { UserDB } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"
import Profile from "../content/Profile"

function user_card(s: UserDB): { [key: string]: HTMLDivElement } {
  const { username, displayname, image, badges } = s
  const card = kelement("div", "card")
  const eleft = kelement("div", "left")
  // const eright = kelement("div", "right")
  const ecimg = kelement("div", "img")
  const img = new Image()
  img.onerror = () => (img.src = "/assets/user.jpg")
  img.alt = username
  img.src = image ? `/file/user/${image}` : "/assets/user.jpg"
  img.width = 50
  const edetail = kelement("div", "detail")
  const eusername = kelement("div", "name", { e: `${username}` })
  const elastchat = kelement("div", "last", { e: escapeHTML(ss(displayname, 30)) })
  if (badges) setbadge(eusername, badges)

  card.append(eleft /*eright*/)
  eleft.append(ecimg, edetail)
  ecimg.append(img)
  edetail.append(eusername, elastchat)
  // eright.append(elastts, eunread)

  return { card, eusername, elastchat }
}
export default class Find implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  constructor() {
    this.id = "find"
    this.isLocked = false
  }
  private createElement() {
    this.el = kelement("div", "Chats pmcenter")
  }
  private renderBtn(): void {
    const searchBar1 = kelement("div", "search", { e: `<p>${lang.FIND_RANDOM}</p>` })
    const btnRandom = kelement("div", "btn btn-random", { e: `<i class="fa-solid fa-play"></i> ${lang.FIND_START}` })
    searchBar1.append(btnRandom)
    const searchBar2 = kelement("div", "search")
    const form = kelement("form", "form form-search-user", {
      a: { action: "/x/profile/search" },
      e: `<p><label for="search_id">${lang.FIND_ID}</label></p><input type="text" name="search_id" id="search_id" placeholder="${lang.TYPE_HERE}" maxLength="30"/><button class="btn"><i class="fa-solid fa-magnifying-glass"></i> ${lang.FIND_SEARCH}</button>`
    })
    searchBar2.append(form)
    const cardlist = kelement("div", "card-list")
    this.el.append(searchBar1, searchBar2, cardlist)
    this.formListener(btnRandom, form, cardlist)
    const inp = form.querySelector("input")
    if (inp) {
      inp.readOnly = true
      inp.focus()
      setTimeout(() => {
        inp.readOnly = false
      }, 100)
    }
  }
  private formListener(btnRandom: HTMLDivElement, form: HTMLFormElement, cardlist: HTMLDivElement): void {
    form.onsubmit = async (e) => {
      e.preventDefault()
      if (this.isLocked) return
      this.isLocked = true
      const data: { [key: string]: string } = {}
      const formData = new FormData(form)
      formData.forEach((val, k) => {
        data[k] = val.toString().trim()
      })
      if (!data.search_id || data.search_id.length < 4) {
        await modal.alert(lang.FIND_LENGTH)
        this.isLocked = false
        return
      }
      resetform(form)
      const eloading = kelement("div", "card", { e: `<div class="getload"><div class="spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div>LOADING</div>` })
      cardlist.prepend(eloading)
      await modal.waittime(1000)
      const searchResult = await xhr.get(`/x/profile/search/${data.search_id}`)
      eloading.remove()
      if (!searchResult || !searchResult.ok) {
        await modal.alert(lang[searchResult.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      const userResult = (<unknown>searchResult?.data?.users || []) as UserDB[]
      if (userResult.length < 1) {
        await modal.alert(lang.FIND_NOTFOUND)
        this.isLocked = false
        return
      }
      while (cardlist.lastChild) {
        cardlist.lastChild.remove()
      }
      this.isLocked = false
      userResult.forEach((usr) => {
        const { card } = user_card(usr)
        cardlist.append(card)
        card.onclick = async () => {
          if (userState.currcontent?.isLocked) return
          if (userState.currcontent?.id === "profile") {
            if ((userState.currcontent as Profile)?.user?.id === usr.id) return
          }
          swiper(new Profile({ user: usr }), userState.currcontent)
        }
      })
      if (userResult.length === 1) {
        const usr = userResult[0]
        if (userState.currcontent?.isLocked) return
        if (userState.currcontent?.id === "profile") {
          if ((userState.currcontent as Profile)?.user?.id === usr.id) return
        }
        swiper(new Profile({ user: usr }), userState.currcontent)
      }
      this.isLocked = false
    }
    btnRandom.onclick = () => {
      notip({ a: "Judul", b: "Keterangan", c: 0 })
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
    userState.center = this
    this.createElement()
    culement.app().append(this.el)
    this.renderBtn()
  }
}
