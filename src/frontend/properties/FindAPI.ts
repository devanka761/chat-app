import FriendBuilder from "./FriendBuilder"

export default class FindAPI {
  private data: FriendBuilder[]
  constructor({ data }: { data: FriendBuilder[] }) {
    this.data = data
  }
  get entries(): FriendBuilder[] {
    return this.data
  }
  get(friend_id: string): FriendBuilder | null {
    return this.data.find((usrch) => usrch.id === friend_id) || null
  }
  add(friend: FriendBuilder): FriendBuilder {
    this.data.push(friend)
    return friend
  }
  remove(friend_id: string): boolean {
    const friend = this.get(friend_id)
    if (friend) {
      this.data = this.data.filter((contact) => contact.user.id !== friend_id)
      return true
    }
    return false
  }
}
