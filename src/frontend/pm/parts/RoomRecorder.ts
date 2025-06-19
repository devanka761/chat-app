import { kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import { checkMedia } from "../../helper/navigator"
import sdate from "../../helper/sdate"
import db from "../../manager/db"
import getVoiceRecorder from "../../manager/voiceRecorder"
import MessageWritter from "../../properties/MessageWritter"
import Room from "../content/Room"

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
  constructor({ room }) {
    this.role = "roomrecorder"
    this.isLocked = false
    this.room = room
    this.recordInterval = null
    this.startTime = 0
    this.chunks = []
    this.canSend = false
    this.isLocked = false
  }
  private createElement(): void {
    this.statusText = kel("div", "record-status", { e: lang.REC_ST_RECORDING })

    this.timestamp = kel("div", "timestamp", { e: "0:00" })

    this.btnCancel = kel("div", "btn btn-cancel")
    this.btnCancel.innerHTML = '<i class="fa-duotone fa-regular fa-trash-xmark fa-fw"></i>'

    this.spinning = kel("div", "btn btn-spinning")
    this.btnSend = kel("div", "btn btn-send", { e: '<i class="fa-solid fa-paper-plane-top"></i>' })

    this.voices = kel("div", "voice", { e: [this.spinning, this.btnSend] })
    this.el = kel("div", "recorder", {
      e: [this.statusText, this.timestamp, this.btnCancel, this.voices]
    })
  }
  private btnListener(): void {
    this.btnSend.onclick = () => {
      if (this.isLocked) return
      this.isLocked = true
      this.canSend = true
      this.stop()
    }
    this.btnCancel.onclick = () => {
      if (this.isLocked) return
      this.isLocked = true
      this.canSend = false
      this.close()
    }
  }
  private startRecording(): void {
    if (!this.mediaRecorder || !this.mediaStream) return
    this.mediaRecorder.start()
    this.startTime = Date.now()
    this.recordInterval = setInterval(() => {
      this.timestamp.innerHTML = sdate.durrNumber(Date.now() - this.startTime)
    }, 200)
  }
  growArea(): void {
    this.room.resizeMiddle(1)
  }
  private async destroyMedia(): Promise<void> {
    if (this.mediaRecorder) this.mediaRecorder.stop()
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.enabled = false
        await modal.waittime(1000)
        track.stop()
        this.mediaStream.removeTrack(track)
        await modal.waittime(500)
      }
    }
    this.mediaRecorder = null
    this.mediaStream = null
    console.log("destroyed!")
  }
  close(): void {
    if (this.recordInterval) clearInterval(this.recordInterval)
    this.destroyMedia()
    this.spinning.remove()
    this.btnSend.remove()
    this.voices.remove()
    this.bottom.removeChild(this.el)
    this.el.remove()
    this.isLocked = false
    this.room.form.open()
  }
  private setupAudioRecorder(): void {
    if (!this.mediaRecorder || !this.mediaStream) return
    this.mediaRecorder.onerror = () => {
      return modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + " #1")
    }
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data)
    }
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: "audio/ogg; codecs=0" })
      this.chunks = []
      console.log(this.canSend)
      if (!this.canSend) return
      const reader = new FileReader()
      reader.onload = () => this.send(reader.result)
      reader.readAsDataURL(blob)
    }
  }
  send(rawsrc: string | ArrayBuffer | null): void {
    console.log("sending...")
    if (!rawsrc) return this.close()
    const writter = new MessageWritter()
      .setUserId(db.me.id)
      .setTimeStamp()
      .addFile({
        isVoice: true,
        name: "voice_" + ".ogg",
        src: rawsrc.toString()
      })
    if (!writter.isValid) return this.close()
    this.room.sendWritter(writter.toJSON())
    this.close()
  }
  async stop(): Promise<void> {
    if (this.recordInterval) clearInterval(this.recordInterval)
    this.spinning.style.visibility = "hidden"
    this.btnCancel.style.visibility = "hidden"
    this.statusText.innerHTML = lang.FINISHING
    this.timestamp.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'
    this.btnSend.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>'
    await modal.waittime(2000)
    if (!this.mediaRecorder) {
      return this.close()
    }
    this.mediaRecorder.stop()
  }
  async init(): Promise<void> {
    const checkPerm = await checkMedia({ audio: true })
    if (!checkPerm) {
      await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES)
      return
    }
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
  run(bottom: HTMLDivElement): void {
    this.bottom = bottom
    this.init()
  }
}
