import ContactCard from "../../parts/friends/ContactCard"
import { TFriendsTypeF } from "../../../types/room.types"

export default class ContactsAPI {
  private data: ContactCard[]
  private current: TFriendsTypeF
  constructor({ data }: { data: ContactCard[] }) {
    this.data = data
    this.current = "friend"
  }
  get entries(): ContactCard[] {
    return this.data
  }
  get(contact_name: TFriendsTypeF): ContactCard | null {
    // return this.data.find((contact) => contact.json.type === contact_name) || null;
    return this.data.find((contact) => contact.type === contact_name) || null
  }
  add(contact_card: ContactCard): this {
    this.data.push(contact_card)
    return this
  }
  get enabled(): TFriendsTypeF {
    return this.current
  }
  set enabled(contact_name: TFriendsTypeF) {
    this.current = contact_name
    this.entries.forEach((contact) => {
      if (contact.type === contact_name) {
        contact.highlight()
      } else {
        contact.off()
      }
    })
  }
  remove(contact_name: string): void {
    this.data = this.data.filter((contact) => contact.type !== contact_name)
  }
}
