import { kel, epm } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import xhr from "../../helper/xhr"
import userState from "../../main/userState"
import resetform from "../../manager/resetform"
import FindAPI from "../props/find/FindAPI"
import FriendBuilder from "../props/friends/FriendBuilder"
import { IUserF } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"
import waittime from "../../helper/waittime"

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
    await waittime(500)
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
      this.searchUser(data.search_id, cardlist)
    }
    btnRandom.onclick = () => {
      if (this.isLocked) return
      this.isLocked = true
      this.searchUser("user", cardlist)
    }
  }
  private async searchUser(search_id: string, cardlist: HTMLDivElement): Promise<void> {
    const eloading = kel("div", "card", { e: `<div class="getload"><div class="spinner"><i class="fa-solid fa-circle-notch fa-spin"></i></div>LOADING</div>` })
    cardlist.prepend(eloading)
    await waittime(1000)
    const searchResult = await xhr.get(`/x/profile/search/${search_id}`)
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

    if (this.list.entries.length >= 1) {
      this.list.entries.forEach((usr) => {
        this.list.remove(usr.id)
        cardlist.removeChild(usr.html)
      })
    }
    this.isLocked = false
    userResult.forEach((usr) => {
      const card = new FriendBuilder({ user: usr, parent: this }).run()
      cardlist.append(card.html)
      this.list.add(card)
    })
    this.isLocked = false
  }
  update(): void | Promise<void> {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await waittime()
    this.isLocked = false
    this.el.remove()
    this.list.entries.forEach((usr) => this.list.remove(usr.id))
  }
  run(): void {
    userState.center = this
    this.createElement()
    epm().append(this.el)
    this.renderBtn()
  }
}
