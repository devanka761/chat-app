import Member from "../pm/parts/Member"

export default class MembersAPI {
  private data: Member[]
  constructor({ data }: { data: Member[] }) {
    this.data = data
  }
  get entries(): Member[] {
    return this.data
  }
  get(member_id: string): Member | null {
    return this.data.find((usr) => usr.user.id === member_id) || null
  }
  add(member: Member): this {
    this.data.push(member)
    return this
  }
  remove(member_id: string): void {
    const member = this.get(member_id)
    if (member) member.remove()
    this.data = this.data.filter((usr) => usr.user.id !== member_id)
  }
}
