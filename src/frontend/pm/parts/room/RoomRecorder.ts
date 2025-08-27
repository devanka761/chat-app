import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import { checkMedia } from "../../../helper/navigator"
import sdate from "../../../helper/sdate"
import db from "../../../manager/db"
import getVoiceRecorder from "../../../manager/voiceRecorder"
import MessageWritter from "../../props/room/MessageWritter"
import Room from "../../content/Room"
import waittime from "../../../helper/waittime"

export default class RoomRecorder {
  readonly role: string
  public isLocked: boolean
  public room: Room
  private bottom: HTMLDivElement
  private statusText: HTMLDivElement
  private voices: HTMLDivElement
  private spinning: HTMLDivElement
  private btnSend: HTMLDivElement
  private btnCancel: HTMLDivElement
  private timestamp: HTMLDivElement
  private el: HTMLDivElement
  private recordInterval: ReturnType<typeof setInterval> | null
  private startTime: number
  private mediaStream: MediaStream | null | undefined
  private mediaRecorder: MediaRecorder | null | undefined
  private canSend: boolean
  private chunks: Blob[]
  private sendIcon: HTMLElement
  private permTry: number
  constructor({ room }) {
    this.role = "roomrecorder"
    this.isLocked = false
    this.room = room
    this.recordInterval = null
    this.startTime = 0
    this.chunks = []
    this.canSend = false
    this.isLocked = false
    this.permTry = 1
  }
  private createElement(): void {
    this.statusText = kel("div", "record-status", { e: lang.REC_ST_RECORDING })

    this.timestamp = kel("div", "timestamp", { e: "0:00" })

    this.btnCancel = kel("div", "btn btn-cancel")
    this.btnCancel.innerHTML = '<i class="fa-duotone fa-regular fa-trash-xmark fa-fw"></i>'

    this.spinning = kel("div", "btn btn-spinning")
    this.sendIcon = kel("i", "fa-solid fa-paper-plane-top")
    this.btnSend = kel("div", "btn btn-send", { e: this.sendIcon })

    this.voices = kel("div", "voice", { e: [this.spinning, this.btnSend] })
    this.el = kel("div", "recorder", {
      e: [this.statusText, this.timestamp, this.btnCancel, this.voices]
    })
  }
  private btnListener(): void {
    this.btnSend.onclick = () => {
      if (this.isLocked) return
      this.isLocked = true
      this.stop(true)
    }
    this.btnCancel.onclick = () => {
      if (this.isLocked) return
      this.isLocked = true
      this.stop(false)
    }
  }
  private destroyWhenWrongClicked(): void {
    window.addEventListener(
      "click",
      (e) => {
        const { target } = e
        if (target instanceof Node) {
          if (this.btnSend.contains(target) || this.btnCancel.contains(target) || this.spinning.contains(target) || this.voices.contains(target) || this.sendIcon.contains(target)) {
            return
          } else if (this.el.contains(target)) {
            this.destroyWhenWrongClicked()
            return
          } else {
            this.stop(false)
            return
          }
        }
      },
      { once: true }
    )
  }
  private startRecording(): void {
    if (!this.mediaRecorder || !this.mediaStream) return
    this.destroyWhenWrongClicked()
    this.mediaRecorder.start()
    this.startTime = Date.now()
    this.growArea()
    this.recordInterval = setInterval(() => {
      this.timestamp.innerHTML = sdate.durrNumber(Date.now() - this.startTime)
    }, 200)
  }
  growArea(): void {
    this.room.resizeMiddle(this.el.clientHeight)
  }
  private async destroyMedia(): Promise<void> {
    if (this.mediaStream) {
      await waittime(1000)
      this.mediaStream.getTracks().forEach((track) => track.stop())
    }
    this.mediaRecorder = null
    this.mediaStream = null
  }
  private setupAudioRecorder(): void {
    if (!this.mediaRecorder || !this.mediaStream) return
    this.mediaRecorder.onerror = () => {
      this.destroyMedia()
      return modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + " #1")
    }
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data)
    }
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=0" })
      this.chunks = []
      if (!this.canSend) {
        this.destroyMedia()
        return
      }
      this.send(blob)
    }
  }
  async send(blob: Blob): Promise<void> {
    await waittime(2000)
    this.destroyMedia()
    if (!blob) return this.close()
    const filesrc: string | null = await new Promise((resolve) => {
      const reader: FileReader = new FileReader()
      reader.onload = () => resolve(reader.result?.toString() || null)
      reader.readAsDataURL(blob)
    })
    if (!filesrc) return this.close()
    const writter = new MessageWritter()
      .setUserId(db.me.id)
      .setTimeStamp()
      .addFile({
        isVoice: true,
        name: "voice_message" + ".ogg",
        src: filesrc
      })
    if (!writter.isValid) return this.close()
    this.room.sendWritter(writter.toJSON())
    this.close()
  }
  async stop(wantToSend: boolean): Promise<void> {
    if (this.recordInterval) clearInterval(this.recordInterval)
    if (wantToSend) this.canSend = wantToSend
    if (this.mediaRecorder) this.mediaRecorder.stop()
    if (wantToSend !== true) return this.close()
    this.spinning.style.visibility = "hidden"
    this.btnCancel.style.visibility = "hidden"
    this.statusText.innerHTML = lang.FINISHING.toLowerCase()
    this.timestamp.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'
    this.btnSend.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'
  }
  close(): void {
    this.reset()
    this.spinning.remove()
    this.btnSend.remove()
    this.voices.remove()
    this.bottom.removeChild(this.el)
    this.el.remove()
    this.isLocked = false
    this.room.form.open()
  }
  async init(): Promise<void> {
    if (this.mediaRecorder || this.mediaStream || this.isLocked) return
    this.isLocked = true
    const checkPerm = await checkMedia({ audio: true })
    if (!checkPerm) {
      await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES)
      this.isLocked = false
      return
    }
    if (this.permTry <= 1) {
      await waittime(500)
      this.isLocked = false
      this.permTry = 2
      return this.init()
    }
    this.isLocked = false
    const voiceRecorder = await getVoiceRecorder()
    if (!voiceRecorder) {
      await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES)
      return
    }
    this.room.form.close()
    this.mediaRecorder = voiceRecorder.media
    this.mediaStream = voiceRecorder.stream
    this.createElement()
    this.bottom.append(this.el)
    this.btnListener()
    this.setupAudioRecorder()
    this.startRecording()
  }
  reset(): void {
    this.isLocked = false
    this.recordInterval = null
    this.startTime = 0
    this.chunks = []
    this.canSend = false
    this.isLocked = false
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(bottom: HTMLDivElement): void {
    this.bottom = bottom
    this.init()
  }
}
