import { IUserF } from "../types/db.types"
import { lang } from "./lang"
export default function noUser(): IUserF {
  return {
    id: "-1",
    username: lang.FORMER_MEMBER,
    displayname: lang.FORMER_MEMBER
  }
}
