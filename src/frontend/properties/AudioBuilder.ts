import { kel } from "../helper/kel"
import sdate from "../helper/sdate"
import MessageBuilder from "./MessageBuilder"

async function waittime(ts: number = 500, tsa: number = 5): Promise<void> {
  const ms: number = ts - tsa || 0
  return new Promise((resolve) => setTimeout(resolve, ms))
}
type AudioType = "audio" | "voice"
export default class AudioBuilder {
  public isLocked: boolean
  private el: HTMLDivElement
  private control: HTMLDivElement
  private range: HTMLInputElement
  private durrtext: HTMLSpanElement
  private msg: MessageBuilder
  private audio: HTMLAudioElement
  private isPlaying: boolean
  private type: AudioType
  constructor(s: { msg: MessageBuilder; audio: HTMLAudioElement }) {
    this.isLocked = false
    this.msg = s.msg
    this.audio = s.audio
    this.isPlaying = false
    this.type = "audio"
  }
  createElement(): void {
    const typeIcon = kel("i", "fa-duotone fa-light fa-fw fa-" + (this.type === "voice" ? "microphone-lines" : "music-note"))
    const iconParent = kel("div", "icon-type", { e: typeIcon })
    this.control = kel("div", "btn")
    const controlParent = kel("div", "control", { e: this.control })
    this.range = kel("input", "inp-range", {
      a: {
        type: "range",
        name: `range_${this.msg.id}_${this.msg.json.user.id}`,
        id: `range_${this.msg.id}_${this.msg.json.user.id}`,
        min: "0",
        max: "100",
        value: "0"
      }
    })
    const rangeParent = kel("div", "range", { e: this.range })
    this.durrtext = kel("p", null, { e: "0:00" })
    const durrParent = kel("div", "duration", { e: this.durrtext })
    this.el = kel("div", "voice", { e: [iconParent, controlParent, rangeParent, durrParent] })
  }
  setType(audioType: AudioType): this {
    this.type = audioType
    return this
  }
  play(): void {
    if (this.isLocked) return
    this.audio.play()
    this.isPlaying = true
    this.control.classList.add("playing")
  }
  pause(): void {
    if (this.isLocked) return
    this.isPlaying = false
    this.audio.pause()
    this.control.classList.remove("playing")
  }
  btnListener(): void {
    this.control.onclick = () => {
      if (this.isPlaying) return this.pause()
      this.play()
    }
    this.range.onmouseup = () => {
      if (this.audio.duration === Infinity || isNaN(this.audio.duration)) return
      this.audio.currentTime = Math.floor((Number(this.range.value) * this.audio.duration) / 100)
      this.time = this.audio.currentTime
    }
    this.range.onmousedown = () => this.pause()
  }
  async stop(): Promise<void> {
    this.pause()
    if (this.isLocked) return
    this.isLocked = true
    await waittime(100)
    this.audio.currentTime = 0
    this.range.value = "0"
    this.isLocked = false
  }
  set text(currentTime: number) {
    if (currentTime !== Infinity) {
      this.durrtext.innerHTML = sdate.durrNumber(Math.floor(currentTime * 1000))
    }
  }
  set time(currentTime: number) {
    if (this.audio.duration !== Infinity && currentTime > 0) {
      this.durrtext.innerHTML = sdate.durrNumber(Math.floor(currentTime * 1000))
      const rangetime = Math.floor((currentTime / this.audio.duration) * 100)
      this.range.value = rangetime.toString()
    }
  }
  get html(): HTMLDivElement {
    return this.el
  }
  remove(): void {
    this.el.remove()
  }
  run(): this {
    this.createElement()
    this.btnListener()
    return this
  }
}
