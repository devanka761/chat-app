import { kel, eroot } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import notip from "../../helper/notip"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import resetform from "../../manager/resetform"
import FindAPI from "../../properties/FindAPI"
import FriendBuilder from "../../properties/FriendBuilder"
import { IUserF } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"

export default class Find implements PrimaryClass {
  readonly role: string
  king: "center" | "content"
  isLocked: boolean
  private el: HTMLDivElement
  private list: FindAPI
  constructor() {
    this.king = "center"
    this.role = "find"
    this.isLocked = false
    this.list = new FindAPI({ data: [] })
  }
  private createElement() {
    this.el = kel("div", "Chats pmcenter")
  }
  private renderBtn(): void {
    const searchBar1 = kel("div", "search", { e: `<p>${lang.FIND_RANDOM}</p>` })
    const btnRandom = kel("div", "btn btn-random", { e: `<i class="fa-solid fa-play"></i> ${lang.FIND_START}` })
    searchBar1.append(btnRandom)
    const searchBar2 = kel("div", "search")
    const form = kel("form", "form form-search-user", {
      a: { action: "/x/profile/search" },
      e: `<p><label for="search_id">${lang.FIND_ID}</label></p><input type="text" name="search_id" id="search_id" placeholder="${lang.TYPE_HERE}" maxLength="30" autocomplete="off"/><button class="btn"><i class="fa-solid fa-magnifying-glass"></i> ${lang.FIND_SEARCH}</button>`
    })
    searchBar2.append(form)
    const cardlist = kel("div", "card-list")
    this.el.append(searchBar1, searchBar2, cardlist)
    this.formListener(btnRandom, form, cardlist)
    const inp = form.querySelector("input")
    if (inp) this.focus(inp)
  }
  async focus(inp: HTMLInputElement) {
    await modal.waittime(500)
    inp.readOnly = true
    inp.focus()
    setTimeout(() => {
      inp.readOnly = false
    }, 100)
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
      const eloading = kel("div", "card", { e: `<div class="getload"><div class="spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div>LOADING</div>` })
      cardlist.prepend(eloading)
      await modal.waittime(1000)
      const searchResult = await xhr.get(`/x/profile/search/${data.search_id}`)
      eloading.remove()
      if (!searchResult || !searchResult.ok) {
        await modal.alert(lang[searchResult.msg] || lang.ERROR)
        this.isLocked = false
        return
      }
      const userResult = (<unknown>searchResult?.data?.users || []) as IUserF[]
      if (userResult.length < 1) {
        await modal.alert(lang.FIND_NOTFOUND)
        this.isLocked = false
        return
      }

      if (this.list.entries.length >= 1)
        this.list.entries.forEach((usr) => {
          this.list.remove(usr.id)
          cardlist.removeChild(usr.html)
        })
      this.isLocked = false
      userResult.forEach((usr) => {
        const card = new FriendBuilder({ user: usr, parent: this }).run()
        cardlist.append(card.html)
        // card.onclick = async () => {
        //   if (userState.currcontent?.isLocked) return
        //   if (userState.currcontent?.role === "profile") {
        //     if ((userState.currcontent as Profile)?.user?.id === usr.id) return
        //   }
        //   swiper(new Profile({ user: usr }), userState.currcontent)
        // }
      })
      this.isLocked = false
    }
    btnRandom.onclick = () => {
      notip({ a: "Judul", b: "Keterangan", c: 0 })
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
    userState.center = this
    this.createElement()
    eroot().append(this.el)
    this.renderBtn()
  }
}
