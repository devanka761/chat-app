import { KelementAttr, SSKelement } from "../types/helper.types"

const idAliases = ["id", "#"] as const
const childAliases = ["child", "e"] as const
const attrAliases = ["a", "attr"] as const

function getIdValue(cla: KelementAttr): string | undefined {
  for (const key of idAliases) {
    if (key in cla) return cla[key as string]
  }
  return undefined
}
function getAttrValue(cla: KelementAttr): string | undefined {
  for (const key of attrAliases) {
    if (key in cla) return cla[key as string]
  }
  return undefined
}
function getChildValue(cla: KelementAttr): (keyof SSKelement | string)[] | undefined {
  for (const key of childAliases) {
    const k = <string>key
    if (key in cla) return Array.isArray(cla[k]) ? cla[k] : [cla[k]]
  }
  return undefined
}
// function createElementWithMap<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
//   return document.createElement(tagName)
// }
export default function kelement<KelementTag extends keyof HTMLElementTagNameMap>(
  tagName: KelementTag,
  className?: string | null,
  prop?: KelementAttr
): HTMLElementTagNameMap[KelementTag] {
  const el = document.createElement(tagName)
  // const el = createElementWithMap(tagName)
  idAliases.forEach((alias) => {
    if (prop?.[alias]) {
      const idVal = getIdValue({ [alias]: prop[alias] })
      if (idVal) el.id = idVal
    }
  })
  if (className) el.setAttribute("class", className)
  attrAliases.forEach((alias) => {
    if (prop?.[alias]) {
      const attrVal = getAttrValue({ [alias]: prop[alias] })
      if (attrVal) {
        Object.keys(attrVal).forEach((attribute) => {
          if (attrVal?.[attribute] && typeof attrVal[attribute] === "string") {
            el.setAttribute(attribute, attrVal[attribute])
          }
        })
      }
    }
  })
  childAliases.forEach((alias) => {
    if (prop?.[alias]) {
      const childVal = getChildValue({ [alias]: prop[alias] })
      if (childVal) {
        childVal.forEach((childElement) => {
          if (typeof childElement === "string") {
            el.innerHTML += childElement
          } else {
            el.append(childElement)
          }
        })
      }
    }
  })
  return el
}
