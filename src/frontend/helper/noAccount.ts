import { IUserF } from "../types/db.types"
import { lang } from "./lang"

export default function noAccount(): IUserF {
  return {
    id: "-1",
    username: lang.DELETED_USER,
    displayname: lang.DELETED_USER
  }
}
