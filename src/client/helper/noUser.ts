import { lang } from "./lang"
export default function noUser() {
  return {
    id: "-1",
    username: lang.DELETED_USER,
    displayname: lang.DELETED_USER
  }
}
