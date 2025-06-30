import { epm, kel, qutor } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import setbadge from "../../helper/setbadge"
import userState from "../../main/userState"
import { PeerCallHandler } from "../../manager/Peer"
import getPeerStream from "../../manager/peerStream"
import socketClient from "../../manager/socketClient"
import { IUserF } from "../../types/db.types"

export default class VoiceCall {
  isLocked: boolean
  private el: HTMLDivElement
  user: IUserF
  private btnMinimize: HTMLDivElement
  private timestamp: HTMLDivElement
  private actInfo: HTMLDivElement
  private btnDeafen: HTMLDivElement
  private btnMute: HTMLDivElement
  private btnHangUp: HTMLDivElement
  private leftAct: HTMLDivElement
  private rightAct: HTMLDivElement
  private mediaStream: MediaStream | null
  private peerMedia: HTMLAudioElement | null
  peer: PeerCallHandler
  private microphone: boolean
  private speaker: boolean
  constructor(s: { user: IUserF }) {
    this.user = s.user
    this.isLocked = false
    this.mediaStream = null
    this.peerMedia = null
    this.microphone = false
    this.speaker = false
    this.run()
  }
  private createElement(): void {
    this.el = kel("div", "call")
  }
  private writeBackground(): void {
    const img = new Image()
    img.onerror = () => (img.src = "/assets/user.jpg")
    img.src = this.user.image ? `/file/user/${this.user.image}` : "/assets/user.jpg"
    img.alt = this.user.username
    const profile_picture = kel("div", "profpic", { e: img })
    const bg = kel("div", "background", { e: profile_picture })
    this.el.append(bg)
  }
  writeTab(): void {
    const tab = kel("div", "top")
    this.el.append(tab)

    const detail = kel("div", "detail")
    this.actInfo = kel("div", "act-info")

    tab.append(detail, this.actInfo)

    this.btnMinimize = kel("div", "btn btn-minimize")
    this.btnMinimize.innerHTML = '<i class="fa-solid fa-chevron-down fa-fw"></i>'
    const caller = kel("div", "caller")
    const displayName = kel("div", "displayname")
    displayName.innerText = this.user.displayname
    if (this.user.badges) setbadge(displayName, this.user.badges)
    this.timestamp = kel("div", "ts", { e: lang.CALL_PREPARING })
    caller.append(displayName, this.timestamp)
    detail.append(this.btnMinimize, caller)
  }
  writeActions(): void {
    const bottom = kel("div", "bottom")
    this.el.append(bottom)

    const actList = kel("div", "act-list")
    bottom.append(actList)
    this.leftAct = kel("div", "call-act disabled")
    this.rightAct = kel("div", "call-act")
    actList.append(this.leftAct, this.rightAct)
    this.btnDeafen = kel("div", "btn btn-deafen", { e: '<i class="fa-solid fa-volume fa-fw"></i>' })
    this.btnMute = kel("div", "btn btn-mute", { e: '<i class="fa-solid fa-microphone fa-fw"></i>' })
    this.leftAct.append(this.btnDeafen, this.btnMute)
    this.btnHangUp = kel("div", "btn btn-hangup", { e: '<i class="fa-solid fa-phone-hangup fa-fw"></i>' })
    this.rightAct.append(this.btnHangUp)
  }
  async call(): Promise<void> {
    this.mediaStream = await getPeerStream()
    if (!this.mediaStream) {
      this.off()
      await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES)
      return
    }
    this.peer.call(this.mediaStream)
  }
  async answer(offer: RTCSessionDescriptionInit): Promise<void> {
    this.mediaStream = await getPeerStream()
    if (!this.mediaStream) {
      this.off()
      await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES)
      return
    }
    this.peer.answer(this.mediaStream, offer)
  }
  private enableActions(): void {
    this.microphone = true
    this.speaker = true
    this.leftAct.classList.remove("disabled")
    this.btnListener()
  }
  private btnListener(): void {
    this.el.onclick = (event) => {
      const { target } = event
      if (target instanceof Node === false) return
      if (this.btnMute.contains(target)) {
        if (!this.mediaStream || !this.peerMedia) return
        this.microphone = !this.microphone
        this.mediaStream.getTracks().forEach((track) => {
          track.enabled = this.microphone
        })
        const icon = qutor("i", this.btnMute)
        if (this.microphone) {
          this.btnMute.classList.remove("active")
          icon?.classList.remove("fa-microphone-slash")
          icon?.classList.add("fa-microphone")
        } else {
          this.btnMute.classList.add("active")
          icon?.classList.remove("fa-microphone")
          icon?.classList.add("fa-microphone-slash")
        }
        this.peer.send("microphone-" + (this.microphone ? "on" : "off"))
      } else if (this.btnDeafen.contains(target)) {
        if (!this.peerMedia || !this.mediaStream) return
        this.speaker = !this.speaker

        this.peerMedia.volume = Number(this.speaker)

        const icon = qutor("i", this.btnDeafen)
        if (this.microphone) {
          this.btnDeafen.classList.remove("active")
          icon?.classList.remove("fa-volume-slash")
          icon?.classList.add("fa-volume")
        } else {
          this.btnDeafen.classList.add("active")
          icon?.classList.remove("fa-volume")
          icon?.classList.add("fa-volume-slash")
        }

        this.peer.send("speaker-" + (this.speaker ? "on" : "off"))
      } else if (this.btnHangUp.contains(target)) {
        this.off()
      }
    }
  }
  infoMute(isMute: boolean) {
    let card = qutor(".mute", this.actInfo)
    if (!card) {
      card = kel("div", "card mute")
      card.innerHTML = `<i class="fa-solid fa-microphone-slash"></i> <span>${this.user.username} ${lang.CALL_MUTED}</span>`
    }
    if (isMute) {
      if (!this.actInfo.contains(card)) this.actInfo.append(card)
    } else {
      if (this.actInfo.contains(card)) this.actInfo.removeChild(card)
    }
  }
  infoDeafen(isDeafen: boolean) {
    let card = qutor(".deafen", this.actInfo)
    if (!card) {
      card = kel("div", "card deafen")
      card.innerHTML = `<i class="fa-solid fa-volume-slash"></i> <span>${this.user.username} ${lang.CALL_DEAFEN}</span>`
    }
    if (isDeafen) {
      if (!this.actInfo.contains(card)) this.actInfo.append(card)
    } else {
      if (this.actInfo.contains(card)) this.actInfo.removeChild(card)
    }
  }
  deafen(speaker: boolean) {
    this.peer.send("speaker-" + (speaker ? "on" : "off"))
  }
  run(): void {
    userState.media = this
    this.createElement()
    epm().append(this.el)
    this.writeBackground()
    this.writeTab()
    this.writeActions()
    this.startHandler()
    this.btnListener()
  }
  off(): void {
    this.peer.hangup()
  }
  private startHandler(): void {
    this.peer = new PeerCallHandler({
      onSignal: (data) => {
        socketClient.send({ ...data, to: this.user.id })
      },
      onStream: (stream) => {
        this.peerMedia = new Audio()
        this.peerMedia.srcObject = stream
        this.peerMedia.play()
        this.enableActions()
      },
      onMessage: (message) => {
        switch (message) {
          case "microphone-on":
            this.infoMute(false)
            break
          case "microphone-off":
            this.infoMute(true)
            break
          case "speaker-on":
            this.infoDeafen(false)
            break
          case "speaker-off":
            this.infoDeafen(true)
            break
          default:
            break
        }
      },
      onDisconnected: () => {
        this.off()
        if (this.peerMedia) {
          this.peerMedia.pause()
          this.peerMedia.remove()
          this.peerMedia = null
        }
        console.log("disconnected")
      },
      onConnectionFailed: () => {
        this.off()
        if (this.peerMedia) {
          this.peerMedia.pause()
          this.peerMedia.remove()
          this.peerMedia = null
        }
        console.log("connection failed")
      }
    })
  }
}
