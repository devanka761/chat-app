export default class ClientData {
  readonly id: string
  constructor({ id }) {
    this.id = id
  }
  async init(s) {
    if (this.id === "id" || !this[this.id]) return
    this[this.id](s)
  }
}
