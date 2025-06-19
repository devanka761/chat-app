import { kel } from "../helper/kel"
import sdate from "../helper/sdate"
import MessageBuilder from "./MessageBuilder"

async function waittime(ts: number = 500, tsa: number = 5): Promise<void> {
  const ms: number = ts - tsa || 0
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export default class VoiceBuilder {
  public isLocked: boolean
  private el: HTMLDivElement
  private control: HTMLDivElement
  private range: HTMLInputElement
  private durrtext: HTMLSpanElement
  private msg: MessageBuilder
  private audio: HTMLAudioElement
  private isPlaying: boolean
  constructor(s: { msg: MessageBuilder; audio: HTMLAudioElement }) {
    this.isLocked = false
    this.msg = s.msg
    this.audio = s.audio
    this.isPlaying = false
  }
  createElement(): void {
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
    this.el = kel("div", "voice", { e: [controlParent, rangeParent, durrParent] })
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
  }
  async stop(): Promise<void> {
    this.pause()
    if (this.isLocked) return
    this.isLocked = true
    await waittime(100)
    this.audio.currentTime = 0
    this.isLocked = false
  }
  set time(currentTime: number) {
    this.durrtext.innerHTML = sdate.durrNumber(currentTime * 1000)
    if (this.audio.duration !== Infinity) {
      const rangetime = Math.floor((currentTime / this.audio.duration) * 100)
      this.range.value = rangetime.toString()
      console.log(rangetime)
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
