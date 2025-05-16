import modal from "../../helper/modal.js";
import { setbadge } from "../../manager/badge.js";
import cloud from "../../manager/cloud.js";
import db from "../../manager/db.js";
import VoiceCall from "./VoiceCall.js";

export let currcall = null;
let currring = null;

export function checkCall() {
  if(currcall || currring) return true;
  return false;
}

function callman(callclass) {
  currcall = callclass;
  currring = callclass;
}

export function checkMedia({audio = true, video = false} = {}) {
  return new Promise(resolve => {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return resolve(0);
    navigator.mediaDevices.getUserMedia({ audio, video }).then(_ => {
      return resolve(1);
    }).catch(_ => {
      return resolve(0);
    });
  });
}

export function SendCall({user}) {
  if(currcall || currring) return;
  new VoiceCall({callman, user}).run();
}

export function ReceiveCall(user_id, silenced = 0) {
  if(currcall) return;
  const user = Object.values(db.ref.friends).find(usr => usr.id === user_id) || null;
  if(!user) return;
  if(currring) return currring.updateRinging();
  currring = new CallNotip({user, silenced: silenced});
  currring.run();
}
export function AnswerCall(user) {
  if(currcall) return;
  new VoiceCall({callman, user}).follow();
}

class CallNotip {
  constructor({user, silenced}) {
    this.user = user;
    this.silenced = silenced;
    this.to = null;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('callnotip');
    if(this.silenced) this.el.classList.add('ignored');
    this.el.innerHTML = `
    <div class="box">
      <div class="caller">
        <div class="img"></div>
        <div class="name">
          <div class="displayname"></div>
          <div class="username"></div>
        </div>
      </div>
      <div class="calltype fa-bounce" style="--fa-animation-duration:4s">
        <p><i class="fa-solid fa-video fa-shake" style="--fa-animation-duration:2s"></i> <span>Incoming Video Call</span></p>
      </div>
      <div class="callactions">
        <div class="btn btn-decline"><i class="fa-solid fa-phone-hangup fa-fw"></i> Decline</div>
        <div class="btn btn-answer"><i class="fa-solid fa-phone fa-fw"></i> Answer</div>
      </div>
      <div class="callaction">
        <div class="btn btn-ignore">Ignore</div>
      </div>
    </div>`;
    const edname = this.el.querySelector('.caller .name .displayname');
    edname.append(this.user.displayName);
    const euname = this.el.querySelector('.caller .name .username');
    euname.append('@' + this.user.username);
    if(this.user.b) {
      for(const badge of this.user.b.sort((a,b) => b - a)) {
        euname.append(setbadge(badge));
      }
    }
    const eimg = this.el.querySelector('.caller .img');
    const img = new Image();
    img.onerror = () => img.src = '/assets/user.jpg';
    img.alt = this.user.username;
    img.src = this.user.img ? `/file/user/${this.user.img}` : '/assets/user.jpg';
    eimg.append(img);
  }
  prepare() {
    this.updateRinging();
    const btnAnswer = this.el.querySelector('.box .callactions .btn-answer');
    btnAnswer.onclick = async() => {
      const checkPerm = await checkMedia();
      if(!checkPerm) {
        cloud.asend('hangupCall', { rj: 1 });
        cloud.send({id: 'decline-call', to: (this.user.peer).toString()});
        this.destroy();
        return;
      }
      this.destroy();
      AnswerCall(this.user);
    }
    const btnDecline = this.el.querySelector('.box .callactions .btn-decline');
    btnDecline.onclick = () => {
      cloud.asend('hangupCall', { rj: 1 });
      cloud.send({id: 'decline-call', to: (this.user.peer).toString()});
      this.destroy();
    }

    this.el.onclick = async e => {
      const btnIgnore = this.el.querySelector('.box .callaction .btn-ignore');
      if(btnIgnore.contains(e.target)) {
        this.el.classList.add('out');
        await modal.waittime(50);
        this.el.classList.remove('out');
        this.el.classList.add('ignored');
      } else {
        if(this.el.classList.contains('ignored')) {
          this.el.classList.add('out');
          await modal.waittime(50);
          this.el.classList.remove('ignored', 'out');
        }
      }
    }
  }
  updateRinging() {
    cloud.asend('callPing', {id:this.user.id});
    if(this.to) clearTimeout(this.to);
    this.to = null;
    this.to = setTimeout(() => this.destroy(), 1000 * 2);
  }
  destroy() {
    if(this.to) {
      clearTimeout(this.to);
      this.to = null;
    }
    currcall = null;
    currring = null;
    this.el.remove();
  }
  run() {
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.prepare();
  }
}