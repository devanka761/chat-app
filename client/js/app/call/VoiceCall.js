import modal from "../../helper/modal.js";
import xhr from "../../helper/xhr.js";
import { setbadge } from "../../manager/badge.js";
import db from "../../manager/db.js";
import userState from "../../manager/userState.js";
import cloud from "../../manager/cloud.js";
import * as nrw from "../../manager/nrw.js";
import Empty from "../pmb/Empty.js";
let lang = {};

const callTimeOut = 20;

let repeatSignal = null;
let getConnection = null;
let maxRepeat = null;
let tsTick = {
  loop: null,
  start: null
}

let mediaStream = null;

function tsCount(el) {
  tsTick.start = Date.now();

  tsTick.loop = setInterval(() => {
    const elapsedTime = Date.now() - tsTick.start;
    let jj = Math.floor(elapsedTime / (1000 * 60 * 60));
    let mm = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    let dd = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    mm = jj > 0 ? String(mm).padStart(2, '0') : mm;
    dd = String(dd).padStart(2, '0');
    el.innerHTML = `${jj>0?jj+':':''}${mm}:${dd}`;
  }, 1000);
}
function tsStop() {
  if(tsTick.loop) {
    clearInterval(tsTick.loop);
    tsTick.loop = null;
  }
  if(tsTick.start) tsTick.start = null;
}

export default class VoiceCall {
  constructor({callman, user}) {
    this.callman = callman;
    this.user = user;
    this.call = null;
    this.stream = null;
    this.vSource = null;
    this.micOff = false;
    this.volumeOff = false;
    this.videoOff = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('call');
    this.el.innerHTML = `
    <div class="background">
      <div class="profpic"></div>
    </div>
    <div class="top">
      <div class="detail">
        <div class="btn btn-minimize"><i class="fa-solid fa-chevron-down fa-fw"></i></div>
        <div class="caller">
          <div class="displayname"></div>
          <div class="user">
            <span class="username"></span>
            <span class="ts">preparing</span>
          </div>
        </div>
      </div>
      <div class="act-info"></div>
    </div>
    <div class="bottom">
      <div class="act-list">
        <div class="call-act disabled">
          <div class="btn btn-deafen">
            <i class="fa-solid fa-volume fa-fw"></i>
          </div>
          <div class="btn btn-mute">
            <i class="fa-solid fa-microphone fa-fw"></i>
          </div>
          <div class="btn btn-video">
            <i class="fa-solid fa-video fa-fw"></i>
          </div>
        </div>
        <div class="call-act">
          <div class="btn btn-hangup">
            <i class="fa-solid fa-phone-hangup fa-fw"></i>
          </div>
        </div>
      </div>
    </div>`;
    this.estatus = this.el.querySelector('.top .detail .caller .user .ts');
    this.einfo = this.el.querySelector('.top .act-info');
    const edname = this.el.querySelector('.top .detail .displayname');
    edname.append(this.user.displayName);
    const euname = this.el.querySelector('.top .detail .user .username');
    euname.append('@' + this.user.username);
    if(this.user.b) {
      for(const badge of this.user.b.sort((a,b) => b - a)) {
        edname.append(setbadge(badge));
      }
    }
    const eimg = this.el.querySelector('.profpic');
    const img = new Image();
    img.onerror = () => img.src = '/assets/user.jpg';
    img.alt = this.user.username;
    img.src = this.user.img ? `/file/user/${this.user.img}` : '/assets/user.jpg';
    eimg.append(img);
  }
  btnListener() {
    const btnHangup = this.el.querySelector('.btn-hangup');
    btnHangup.onclick = () => this.actionHangup();

    const btnMute = this.el.querySelector('.btn-mute');
    btnMute.onclick = () => this.actionMic(btnMute);

    const btnDeafen = this.el.querySelector('.btn-deafen');
    btnDeafen.onclick = () => this.actionVol(btnDeafen);

    const btnVideo = this.el.querySelector('.btn-video');
    btnVideo.onclick = async() => modal.alert(lang.CALL_VIDEO_DEVELOPMENT_1);

    this.el.onclick = e => {
      const btnMinimize = this.el.querySelector('.btn-minimize');
      if(btnMinimize.contains(e.target)) {
        this.isMinimize(1);
      } else {
        if(this.el.classList.contains('minimized')) {
          this.isMinimize(0);
        }
      }
    }
  }
  async isMinimize(n=0) {
    const pmContainer = document.querySelector('.app .pm');
    if(n) {
      this.el.classList.add('out');
      await modal.waittime(495);
      pmContainer.classList.add('movedown');
      this.el.classList.add('minimized');
      this.el.classList.remove('out');
      await modal.waittime(495);
      pmContainer.classList.remove('movedown');
      pmContainer.classList.add('oncall');
    } else {
      this.el.classList.add('out');
      pmContainer.classList.remove('oncall');
      pmContainer.classList.add('moveup');
      await modal.waittime(495);
      this.el.classList.remove('out', 'minimized');
      pmContainer.classList.remove('moveup');
    }
  }
  updateActions(s) {
    if(s.from !== this.user.id) return;
    if(s.id.includes('mic')) {
      this.infoIsMute(s.id);
    } else if(s.id.includes('vol')) {
      this.infoIsDeafen(s.id);
    }
  }
  infoIsMute(sid) {
    if(sid === 'act-call-mic-off') {
      if(this.einfo.querySelector('.card.mute')) return;
      const card = document.createElement('div');
      card.classList.add('card', 'mute');
      card.innerHTML = `<i class="fa-solid fa-microphone-slash"></i> <span>${this.user.username} muted</span>`;
      this.einfo.append(card);
    } else if(sid === 'act-call-mic-on') {
      const card = document.querySelector('.card.mute');
      if(!card) return;
      card.remove();
    }
  }
  infoIsDeafen(sid) {
    if(sid === 'act-call-vol-off') {
      if(this.einfo.querySelector('.card.deafen')) return;
      const card = document.createElement('div');
      card.classList.add('card', 'deafen');
      card.innerHTML = `<i class="fa-solid fa-volume-slash"></i> <span>${this.user.username} is deafen</span>`;
      this.einfo.append(card);
    } else if(sid === 'act-call-vol-on') {
      const card = document.querySelector('.card.deafen');
      if(!card) return;
      card.remove();
    }
  }
  actionHangup() {
    if(this.call) {
      this.call.close();
      this.call = null;
    }
    if(tsTick.start || repeatSignal || maxRepeat) this.isMinimize(0);
    tsStop();
    clearInterval(repeatSignal);
    clearInterval(getConnection);
    repeatSignal = null;

    if(this.stream) {
      const oldStream = this.stream;
      for(let i=0;i <= oldStream.getTracks().length - 1;i++) {
        const track = oldStream.getTracks()[i];
        track.enabled = false;
        setTimeout(() => {
          track.stop();
          oldStream.removeTrack(track);
          if(i >= oldStream.getTracks().length - 1) {
            if(mediaStream) {
              mediaStream.pause();
              mediaStream.remove();
              mediaStream = null;
            }
            this.vSource = null;
            this.stream = null;
          }
        }, 495);
      }
    } else {
      if(mediaStream) {
        mediaStream.pause();
        mediaStream.remove();
        mediaStream = null;
      }
      this.vSource = null;
    }
    this.destroy();
  }
  actionMic(e) {
    if(!tsTick.loop) return;
    if(this.stream) {
      this.micOff = !this.micOff;
      for(const track of this.stream.getAudioTracks()) {
        track.enabled = !this.micOff;
      }
      if(this.micOff) {
        e.classList.add('active');
        e.querySelector('i').classList.remove('fa-microphone');
        e.querySelector('i').classList.add('fa-microphone-slash');
        cloud.send({id: 'act-call-mic-off', to: this.user.peer});
        cloud.asend('callMicOff', {id:this.user.id});
      } else {
        e.classList.remove('active');
        e.querySelector('i').classList.remove('fa-microphone-slash');
        e.querySelector('i').classList.add('fa-microphone');
        cloud.send({id: 'act-call-mic-on', to: this.user.peer});
        cloud.asend('callMicOn', {id:this.user.id});
      }
    }
  }
  actionVol(e) {
    this.volumeOff = !this.volumeOff;
    mediaStream.volume = Number(!this.volumeOff);
    if(this.volumeOff) {
      e.classList.add('active');
      e.querySelector('i').classList.remove('fa-volume');
      e.querySelector('i').classList.add('fa-volume-slash');
      cloud.send({id: 'act-call-vol-off', to: this.user.peer});
      cloud.asend('callVolOff', {id:this.user.id});
    } else {
      e.classList.remove('active');
      e.querySelector('i').classList.remove('fa-volume-slash');
      e.querySelector('i').classList.add('fa-volume');
      cloud.send({id: 'act-call-vol-on', to: this.user.peer});
      cloud.asend('callVolOn', {id:this.user.id});
    }
  }
  async pingUser() {
    cloud.asend('callPing', {id:this.user.id});

    const fdb = Object.values(db.ref.friends).find(usr => usr.id === this.user.id) || null;
    if(!fdb) {
      clearInterval(repeatSignal);
      await modal.alert(lang.PROF_ALR_NOFRIEND_1);
      return this.actionHangup();
    }
    if(fdb.peer) {
      this.user.peer = fdb.peer;
      this.estatus.innerHTML = 'ringing';
      clearInterval(repeatSignal);
      repeatSignal = null;
      maxRepeat = null;
      maxRepeat = Date.now() + (1000 * callTimeOut);
      repeatSignal = setInterval(() => this.signalUser(fdb.peer), 1000);
      return;
    }
    if(Date.now() > maxRepeat) {
      clearInterval(repeatSignal);
      maxRepeat = null;
      await modal.alert(lang.CALL_MAX_PING_TRIES_LIMIT);
      return this.actionHangup();
    }
  }
  async callUser() {
    const umedia = await userMedia();
    if(!umedia?.stream) return this.actionHangup();
    this.stream = umedia.stream;
    this.vSource = umedia.kind;
    await modal.waittime(249);
    const call = cloud.call(this.user.peer, umedia.stream);
    call.on('error', () => this.actionHangup());
    call.on('close', () => this.actionHangup());
    call.on('stream', (remoteStream) => this.streamNow(remoteStream));
    this.call = call;
    getConnection = setInterval(() => {
      if(tsTick.start) {
        clearTimeout(getConnection);
        return;
      }
      cloud.asend('voiceCall', {id:this.user.id});
    }, 1000);
    setTimeout(() => {
      clearTimeout(getConnection);
      if(!tsTick.start) return this.actionHangup();
    }, (callTimeOut * 1000) - 3000);
  }
  async answerUser(call) {
    if(call.peer !== this.user.peer) {
      await modal.alert(lang.ERROR);
      return this.actionHangup();
    }

    if(userState.pmbottom?.id == 'content') {
      await userState.pmbottom?.destroy?.();
      if(nrw.isNarrow) {
        nrw.runQueue();
        nrw.setEmpty();
      } else {
        new Empty().run();
      }
      userState.pmlast = userState.pmmid?.id || 'chats';
    }
    const umedia = await userMedia();
    if(!umedia?.stream) return this.actionHangup();

    this.stream = umedia.stream;
    this.vSource = umedia.kind;

    call.answer(umedia.stream);
    call.on('error', () => this.actionHangup());
    call.on('close', () => this.actionHangup());
    call.on('stream', (remoteStream) => this.streamNow(remoteStream));
    this.call = call;

    getConnection = setInterval(() => {
      if(tsTick.start) {
        clearTimeout(getConnection);
        return;
      }
      cloud.asend('voiceCall', {id:this.user.id});
    }, 1000);

    setTimeout(() => {
      clearTimeout(getConnection);
      if(!tsTick.start) return this.actionHangup();
    }, (callTimeOut * 1000) - 3000);
  }
  async streamNow(remoteStream) {
    if(!tsTick.loop && !tsTick.start) tsCount(this.estatus);
    const ecallacts = this.el.querySelectorAll('.call-act.disabled');
    ecallacts.forEach(ecall => ecall.classList.remove('disabled'));
    mediaStream = new Audio();
    mediaStream.srcObject = remoteStream;
    mediaStream.play();
  }
  async signalUser(peerid) {
    const vdb = db.ref.vcall || null;
    if(vdb && vdb.u) {
      const myIdx = vdb.u.findIndex(usr => usr.id === db.ref.account.id);
      const usrIdx = vdb.u.findIndex(usr => usr.id === this.user.id);
      if(vdb.u?.[usrIdx]?.j && vdb.u?.[myIdx]?.j) {
        clearInterval(repeatSignal);
        repeatSignal = null;
        maxRepeat = null;
        this.estatus.innerHTML = 'connecting';
        return this.callUser();
      }
    }
    cloud.send({ "id": "voice-call", "to": peerid });
    cloud.asend('voiceCall', {id:this.user.id});
    if(Date.now() > maxRepeat) {
      clearInterval(repeatSignal);
      maxRepeat = null;
      return this.actionHangup();
    }
  }
  async follow() {
    this.init();
    const updateCall = await xhr.post('/call/uwu/receive', {id:this.user.id});
    if(updateCall?.code !== 200) {
      await modal.alert(lang[updateCall.msg] || lang.ERROR);
      return this.actionHangup();
    }
    this.user.peer = updateCall.data.peer;
    this.estatus.innerHTML = 'connecting';
    getConnection = setInterval(() => {
      if(tsTick.start) {
        clearTimeout(getConnection);
        return;
      }
      cloud.asend('voiceCall', {id:this.user.id});
    }, 1000);

    setTimeout(() => {
      clearTimeout(getConnection);
      if(!tsTick.start) return this.actionHangup();
    }, (callTimeOut * 1000) - 3000);
  }
  async run() {
    this.init();
    const setCall = await xhr.post('/call/uwu/set', {id:this.user.id});
    if(setCall?.code !== 200) {
      await modal.alert(lang[setCall.msg] || lang.ERROR);
      return this.actionHangup();
    }
    this.estatus.innerHTML = 'calling';
    maxRepeat = Date.now() + (1000 * callTimeOut);
    repeatSignal = setInterval(() => this.pingUser(), 1000);
  }
  destroy() {
    if(tsTick.start || repeatSignal || maxRepeat) this.isMinimize(0);
    tsStop();
    db.ref.vcall = {};
    this.callman(null);
    setTimeout(() => this.el.remove(), 495);
    cloud.asend('hangupCall');
  }
  init() {
    this.callman(this);
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.btnListener();
  }
}

function userMedia(n = false) {
  return new Promise(resolve => {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return resolve(null);
    navigator.mediaDevices.getUserMedia({audio:true,video:n}).then(stream => {
      return resolve({
        stream,
        kind: {
          audio:true,
          video:n
        }
      });
    }).catch(err => {
      console.info(err);
      return resolve(null);
    })
  });
}