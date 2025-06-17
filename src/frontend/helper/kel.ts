const malement = {
  app() {
    return <HTMLDivElement>document.querySelector(".app")
  },
  pm() {
    return <HTMLDivElement>document.querySelector(".app .main")
  }
}
import { KelementAttr } from "../../interfaces/helper.interfaces"
import { SSKelement } from "../../types/helper.types"

const idAliases = ["id", "#"] as const
const childAliases = ["child", "e"] as const
const attrAliases = ["a", "attr"] as const

function getIdValue(cla: KelementAttr): string | undefined {
  for (const key of idAliases) {
    if (key in cla) return cla[key as keyof KelementAttr] as string
  }
  return undefined
}
function getAttrValue(cla: KelementAttr): string | undefined {
  for (const key of attrAliases) {
    if (key in cla) return cla[key as keyof KelementAttr] as string
  }
  return undefined
}
function getChildValue(cla: KelementAttr): (keyof SSKelement | string)[] | undefined {
  for (const key of childAliases) {
    if (key in cla) {
      const k = key as keyof KelementAttr
      return (Array.isArray(cla[k]) ? cla[k] : [cla[k]]) as string[]
    }
  }
  return undefined
}

function kelement<KelementTag extends keyof HTMLElementTagNameMap>(tagName: KelementTag, className?: string | null, prop?: KelementAttr): HTMLElementTagNameMap[KelementTag] {
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
          const attr = attribute as keyof typeof attrVal
          if (attrVal?.[attr] && typeof attrVal[attr] === "string") {
            el.setAttribute(attribute, attrVal[attr])
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

function qulement(attrNames: string, parent?: HTMLElement): HTMLElement {
  const el = parent || document.body
  return el.querySelector(attrNames) as HTMLElement
}

export { malement, kelement, qulement }
