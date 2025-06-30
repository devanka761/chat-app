import { KelementAttr, SSKelement } from "../types/helper.types"

export function qutor(classnames: string, parent?: HTMLElement | null): HTMLElement | null {
  const el = parent ?? document.body
  return el.querySelector(classnames)
}

export function eroot(): HTMLDivElement {
  return document.querySelector(".app") as HTMLDivElement
}
export function epm(): HTMLDivElement {
  return document.querySelector(".app .pm") as HTMLDivElement
}

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

export function kel<KelementTag extends keyof HTMLElementTagNameMap>(tagName: KelementTag, className?: string | null, prop?: KelementAttr): HTMLElementTagNameMap[KelementTag] {
  const el = document.createElement(tagName)
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
