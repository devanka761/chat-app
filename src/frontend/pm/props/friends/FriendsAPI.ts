import FriendBuilder from "./FriendBuilder"

export default class FriendsAPI {
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
  remove(friend_id: string): void {
    this.data = this.data.filter((contact) => contact.user.id !== friend_id)
  }
}
