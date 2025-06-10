import { PayloadData, ValidateArr, ValidateObj } from "../types/validate.types"

export default function validate(snap: ValidateArr | ValidateObj, data: PayloadData | null = null) {
  if (!data) throw new Error("The validate's data want to check is null")
  if (snap instanceof Array) {
    const valids = snap.filter((s) => {
      if (typeof s !== "string") {
        throw new Error("The required snap to check should be string")
      }
      return typeof s === "string" && typeof data[s] === "string" && data[s].length >= 1
    })
    if (valids.length !== snap.length) return false
    return true
  } else if (typeof snap === "object") {
    const suptype = ["number", "string", "boolean"]
    const reqs = Object.keys(snap)
    const valids = reqs.filter((s) => {
      if (!suptype.includes(snap[s])) {
        throw new Error("Each required snap to check should be string/number/boolean")
      }
      return typeof data[s] === snap[s]
    })
    if (valids.length !== reqs.length) return false
    return true
  }
  return false
}
