import { kel } from "../../helper/kel"
import { IUserF } from "../../types/db.types"

export default class PostCard {
  isLocked: boolean
  user: IUserF
  private el: HTMLDivElement
  constructor() {
    this.isLocked = false
    this.run()
  }
  createElement(): void {
    this.el = kel("div", "Posts")
  }
  run(): this {
    this.createElement()
    return this
  }
}
