import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import xhr from "../../helper/xhr.js";
import { setbadge } from "../../manager/badge.js";
import db from "../../manager/db.js";
import userState from "../../manager/userState.js";
import Content from "./Content.js";
import * as nrw from "../../manager/nrw.js";
import { SendCall, checkCall, checkMedia } from "../call/Call.js";
let lang = {};

export default class {
  constructor({user, classBefore = null} = { user }) {
    this.id = 'profile';
    this.user = user;
    this.classBefore = classBefore;
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('prof', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">User Detail</div>
    </div>
    <div class="wall">
      <div class="chp displayname"><p>Loading</p></div>
      <div class="chp img">
        <img src="/assets/user.jpg" alt="profile" />
      </div>
      <div class="chp username"><p>@loading</p></div>
      <div class="chp bio">
        <p>l o a d  i n g . . .</p>
      </div>
      <div class="chp actions">
        <div class="btn btn-chat"><i class="fa-solid fa-comment-dots"></i><p>Open Chat</p></div>
        <div class="btn btn-call"><i class="fa-solid fa-phone"></i><p>Voice Call</p></div>
        <div class="btn btn-video"><i class="fa-solid fa-video"></i><p>Video Call</p></div>
      </div>
      <div class="chp options">
      </div>
    </div>`;
  }
  async writeUser() {
    const euname = this.el.querySelector('.wall .username p');
    euname.innerHTML = '';
    euname.append('@' + this.user.username);
    if(this.user.b) {
      for(const badge of this.user.b.sort((a,b) => b - a)) {
        euname.append(setbadge(badge));
      }
    }

    const edname = this.el.querySelector('.wall .displayname p');
    edname.innerHTML = '';
    edname.append(this.user.displayName);

    const ebio = this.el.querySelector('.wall .bio p');
    ebio.innerHTML = '';
    ebio.append(this.user.bio || 'No bio yet.');

    const eimg = this.el.querySelector('.wall .img');
    eimg.innerHTML = '';
    const img = new Image();
    img.onerror = () => img.src = '/assets/user.jpg';
    img.alt = this.user.username;
    img.src = this.user.img ? `/file/user/${this.user.img}` : '/assets/user.jpg';
    eimg.append(img);

    const _user = await modal.loading(xhr.get('/profile/uwu/user/' + this.user.id));
    if(_user && _user.code === 200) {
      this.user = _user.data;
      const cdb = Object.keys(db.ref.chats).filter(k => {
        return db.ref.chats[k].users.find(ch => ch.id === _user.data.id);
      });
      cdb.forEach(k => {
        const usrIdx = db.ref.chats[k].users.findIndex(ch => ch.id === _user.data.id);
        Object.keys(_user.data).forEach(ck => {
          db.ref.chats[k].users[usrIdx][ck] = _user.data[ck];
        });
      });
      const gdb = Object.keys(db.ref.groups).filter(k => {
        return db.ref.groups[k].users.find(ch => ch.id === _user.data.id);
      });
      gdb.forEach(k => {
        const usrIdx = db.ref.groups[k].users.findIndex(ch => ch.id === _user.data.id);
        if(usrIdx > -1) {
          Object.keys(_user.data).forEach(ck => {
            db.ref.groups[k].users[usrIdx][ck] = _user.data[ck];
          });
        }
      });
      userState.pmmid?.forceUpdate?.();
      userState.pmtop?.forceUpdate?.();
    }
    euname.innerHTML = '';
    euname.append('@' + this.user.username);
    if(this.user.b) {
      for(const badge of this.user.b.sort((a,b) => b - a)) {
        euname.append(setbadge(badge));
      }
    }

    edname.innerHTML = '';
    edname.append(this.user.displayName);
    ebio.innerHTML = '';
    ebio.append(this.user.bio || 'No bio yet.');
    eimg.innerHTML = '';
    const nimg = new Image();
    nimg.onerror = () => nimg.src = '/assets/user.jpg';
    nimg.alt = this.user.username;
    nimg.src = this.user.img ? `/file/user/${this.user.img}` : '/assets/user.jpg';
    eimg.append(nimg);

    this.renderActions();
    this.btnListener();
  }
  renderActions() {
    this.eloptions = document.querySelector('.chp.options');
    this.eloptions.innerHTML = '';
    if(this.user.isfriend) {
      return this.ActionFriend();
    };
    if(this.user.theirreq) return this.ActionRequest();
    if(this.user.myreq) return this.ActionSent();
    return this.ActionNoFriend();
  }
  async ActionXHR(ref, useconfirm = false, infotext) {
    if(this.isLocked) return;
    this.isLocked = true;

    if(useconfirm) {
      const isconfirm = await modal.confirm(`${lang[infotext].replace('{user}', this.user.username)}`);
      if(!isconfirm) {
        this.isLocked = false;
        return null;
      }
    }

    this.eloptions.innerHTML = `<div class="btn">Loading</div>`;
    const setreq = await xhr.post(`/profile/uwu/${ref}`, {id:this.user.id});
    if(setreq.data?.user) this.user = setreq.data.user;
    this.isLocked = false;
    return setreq;
  }
  ActionNoFriend() {
    const btn = document.createElement('div');
    btn.classList.add('btn', 'sb');
    btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${lang.PROF_ADD}`;
    this.eloptions.append(btn);
    btn.onclick = async() => {
      await this.ActionXHR('addfriend');
      this.renderActions();
    }
  }
  ActionFriend() {
    const btn = document.createElement('div');
    btn.classList.add('btn', 'sr');
    btn.innerHTML = `<i class="fa-solid fa-user-minus"></i> ${lang.PROF_UNFRIEND}`;
    this.eloptions.append(btn);
    btn.onclick = async() => {
      const act = await this.ActionXHR('unfriend', true, 'PROF_CONF_UNFRIEND');
      if(act?.code === 200) {
        if(act?.data?.user?.id) {
          delete db.ref.friends[act.data.user.chat_key];
          userState.pmmid?.forceUpdate?.();
        }
      }
      this.renderActions();
    }
  }
  ActionRequest() {
    const btn_a = document.createElement('div');
    btn_a.classList.add('btn', 'sg');
    btn_a.innerHTML = `<i class="fa-solid fa-user-check"></i> ${lang.PROF_ACCEPT}`;
    const btn_b = document.createElement('div');
    btn_b.classList.add('btn', 'sr');
    btn_b.innerHTML = `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_IGNORE}`;

    this.eloptions.append(btn_a, btn_b);
    btn_a.onclick = async() => {
      const act = await this.ActionXHR('acceptfriend');
      if(act?.code === 200) {
        if(act?.data?.user?.id) {
          db.ref.account.req = db.ref.account.req?.filter(usr => usr.id !== act.data.user.id);
          db.ref.friends[act.data.user.chat_key] = act.data.user;
          userState.pmmid?.forceUpdate?.();
        }
      }
      this.renderActions();
    }
    btn_b.onclick = async() => {
      const act = await this.ActionXHR('ignorefriend', true, 'PROF_CONF_IGNORE');
      if(act?.code === 200) {
        if(act?.data?.user?.id) {
          db.ref.account.req = db.ref.account.req?.filter(usr => usr.id !== act.data.user.id);
          userState.pmmid?.forceUpdate?.();
        }
      }
      this.renderActions();
    }
  }
  ActionSent() {
    this.eloptions.innerHTML = `<div class="note sy">${lang.PROF_WAIT}</div>`;
    const btn = document.createElement('div');
    btn.classList.add('btn', 'sr');
    btn.innerHTML = `<i class="fa-solid fa-user-xmark"></i> ${lang.PROF_CANCEL}`;
    this.eloptions.append(btn);
    btn.onclick = async() => {
      await this.ActionXHR('cancelfriend', true, 'PROF_CONF_CANCEL');
      this.renderActions();
    }
  }
  btnListener() {
    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        if(this.classBefore) return this.classBefore.run();
        nrw.runQueue();
        nrw.setEmpty();
      }
    }

    const btnChat = this.el.querySelector('.actions .btn-chat');
    btnChat.onclick = async() => {
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      new Content({user:this.user,conty:1}).run();
      userState.locked.bottom = false;
    }
    const btnCall = this.el.querySelector('.actions .btn-call');
    btnCall.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      if(!this.user.isfriend) {
        await modal.alert(lang.PROF_ALR_NOFRIEND_1);
        this.isLocked = false;
        return;
      }

      if(!checkCall) {
        await modal.alert('theres no call');
        this.isLocked = false;
        return;
      }
      const checkPerm = await checkMedia({audio:true});
      if(!checkPerm) {
        await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES);
        this.isLocked = false;
        return;
      }
      this.isLocked = false;
      SendCall({user:this.user});
    }
    const btnVideo = this.el.querySelector('.actions .btn-video');
    btnVideo.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      if(!this.user.isfriend) {
        await modal.alert(lang.PROF_ALR_NOFRIEND_2);
        this.isLocked = false;
        return;
      }
      const confirmVoiceCall = await modal.confirm({
        msg: `${lang.CALL_VIDEO_DEVELOPMENT_1}<br/>${lang.CALL_VIDEO_DEVELOPMENT_2}`,
        okx: 'VOICE CALL'
      });
      if(confirmVoiceCall) {
        this.isLocked = false;
        return btnCall.click();
      }
      this.isLocked = false;
    }
  }
  fRemove() {
    this.isLocked = false;
    userState.pmbottom = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      userState.pmlast = null;
      resolve();
    });
  }
  run() {
    userState.pmbottom = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.writeUser();
  }
}