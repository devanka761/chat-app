import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import db from "../../manager/db.js";
import elgen from "../../manager/elgen.js";
import userState from "../../manager/userState.js";
import Content from "../pmb/Content.js";
import { destroyPM, fRemovePM, isNarrow, setQueue } from "../../manager/nrw.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'chats';
    this.isLocked = false;
    this.list = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chats', 'pmm');
    this.el.innerHTML = `<div class="card-list"></div>`;
  }
  getChatList() {
    const cdb = Object.values(db.ref.chats).sort((a, b) => {
      const cdba = Object.values(a.chats);
      const cdbb = Object.values(b.chats);
      if(cdba[cdba.length - 1]?.ts > cdbb[cdbb.length - 1]?.ts) return 1;
      if(cdba[cdba.length - 1]?.ts < cdbb[cdbb.length - 1]?.ts) return -1;
      return 0;
    });

    this.cardlist = this.el.querySelector('.card-list');
    if(cdb.length < 1) this.cardlist.innerHTML = `<p class="nomore">${lang.CHTS_NOCHAT}<br/>${lang.CHTS_PLS}</p>`;
    if(cdb.length > 0) this.cardlist.querySelector('.nomore')?.remove();
    cdb.forEach(ch => {
      const user = ch.users.find(k => k.id !== db.ref.account.id);
      const {card, uc} = elgen.chatCard(user);
      if(!uc) this.cardlist.prepend(card);
      card.onclick = async() => {
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        if(isNarrow) {
          setQueue();
          await destroyPM();
          fRemovePM();
        }
        new Content({user, conty:1}).run();
        userState.locked.bottom = false;
      }
    });
  }
  btnListener() {
    const btnGlobal = document.createElement('div');
    btnGlobal.classList.add('btn', 'global-btn');
    btnGlobal.innerHTML = '<i class="fa-solid fa-earth-asia"></i> <span>Global Chat</span>';
    this.el.append(btnGlobal);
    btnGlobal.onclick = async() => {
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      if(isNarrow) {
        setQueue();
        await destroyPM();
        fRemovePM();
      }
      const user = db.ref.groups['zzz'];
      new Content({user, conty:2}).run();
      userState.locked.bottom = false;
    };
  }
  forceUpdate() {
    this.getChatList();
  }
  fRemove() {
    this.isLocked = false;
    this.list = [];
    userState.pmmid = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      this.list = [];
      userState.pmmid = null;
      userState.pmlast = null;
      resolve();
    })
  }
  run() {
    userState.pmmid = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    userState.pmtitle?.setTitle('KIRIMIN');
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.getChatList();
    this.btnListener();
  }
}