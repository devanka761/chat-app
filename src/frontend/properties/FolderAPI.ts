import FolderCard from "../pm/parts/FolderCard"
import { TChatsTypeF } from "../types/room.types"

export default class FolderAPI {
  private data: FolderCard[]
  private current: TChatsTypeF
  constructor({ data }: { data: FolderCard[] }) {
    this.data = data
    this.current = "all"
  }
  get entries(): FolderCard[] {
    return this.data
  }
  get(folder_name: TChatsTypeF): FolderCard | null {
    return this.data.find((folder) => folder.json.type === folder_name) || null
  }
  add(folder_card: FolderCard): this {
    this.data.push(folder_card)
    return this
  }
  get enabled(): TChatsTypeF {
    return this.current
  }
  set enabled(folder_name: TChatsTypeF) {
    this.current = folder_name
    this.entries.forEach((folder) => {
      if (folder.json.type === folder_name) {
        folder.highlight()
      } else {
        folder.off()
      }
    })
  }
}
