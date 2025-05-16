import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import db from "../../manager/db.js";
import elgen from "../../manager/elgen.js";
import userState from "../../manager/userState.js";
import Profile from "../pmb/Profile.js";
import * as nrw from "../../manager/nrw.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'friends';
    this.isLocked = false;
    this.list = [];
    this.reqlist = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chats', 'pmm');
    this.el.innerHTML = `<div class="card-list"></div>`;
  }
  getFriendlist() {
    this.cardlist = this.el.querySelector('.card-list');

    const ndb = Object.values(db.ref.friends) || [];
    const odb = this.list || [];

    const fdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    fdb.forEach(ch => {
      this.list.push(ch);
      const card = elgen.friendCard(ch);
      card.id = `fl-${ch.id}`;
      this.cardlist.append(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        if(nrw.isNarrow) {
          nrw.setQueue();
          await nrw.destroyPM();
          nrw.fRemovePM();
        }
        new Profile({user:ch}).run();
        userState.locked.bottom = false;
      }
    });
    const cdb = odb.filter(ch => !ndb.map(nch => nch.id).includes(ch.id));
    cdb.forEach(ch => {
      this.list = this.list.filter(k => k.id !== ch.id);
      const card = this.cardlist.querySelector(`#fl-${ch.id}`);
      if(card) card.remove();
    });
    if(this.list.length < 1 && !this.cardlist.querySelector('.nomore')) {
      const nomore = document.createElement('p');
      nomore.classList.add('nomore');
      nomore.innerHTML = lang.CHTS_NOCHAT;
      this.cardlist.append(nomore);
    } else if(this.list.length >= 1 && this.cardlist.querySelector('.nomore')) {
      this.cardlist.querySelector('.nomore').remove();
    }
  }
  getReqList() {
    const ndb = db.ref.account?.req || [];
    const odb = this.reqlist || [];

    this.cardlist = this.el.querySelector('.card-list');
    const rdb = ndb.filter(ch => !odb.map(och => och.id).includes(ch.id));
    let ereq = null;
    if(rdb.length >= 1 || this.reqlist.length >= 1) {
      ereq = document.querySelector('.freq');
      if(!ereq) {
        ereq = document.createElement('div');
        ereq.classList.add('freq');
        ereq.innerHTML = `<div class="note"><p>Friend Requests</p></div>`;
        this.cardlist.prepend(ereq);
      }
    }
    rdb.forEach(ch => {
      this.reqlist.push(ch);
      const card = elgen.friendCard(ch);
      card.id = `req-${ch.id}`;
      ereq.prepend(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        if(nrw.isNarrow) {
          nrw.setQueue();
          await nrw.destroyPM();
          nrw.fRemovePM();
        }
        new Profile({user:ch}).run();
        userState.locked.bottom = false;
      }
    });
    const cdb = odb.filter(ch => !ndb.map(nch => nch.id).includes(ch.id));
    cdb.forEach(ch => {
      this.reqlist = this.reqlist.filter(k => k.id !== ch.id);
      const card = this.cardlist.querySelector(`.freq #req-${ch.id}`);
      if(card) card.remove();
    });
    if(this.reqlist.length > 0) {
      ereq?.prepend(ereq.querySelector('.note'));
    } else {
      ereq?.remove();
    }
  }
  forceUpdate() {
    this.getReqList();
    this.getFriendlist();
  }
  fRemove() {
    this.isLocked = false;
    this.list = [];
    this.reqlist = [];
    userState.pmmid = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.isLocked = false;
      this.list = [];
      this.reqlist = [];
      userState.pmmid = null;
      userState.pmlast = null;
      this.el.remove();
      resolve();
    })
  }
  run() {
    userState.pmmid = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    userState.pmtitle?.setTitle(lang.APP_FRIENDS);
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.getReqList();
    this.getFriendlist();
  }
}