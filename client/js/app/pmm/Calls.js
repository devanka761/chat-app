import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import db from "../../manager/db.js";
import elgen from "../../manager/elgen.js";
import userState from "../../manager/userState.js";
import * as nrw from "../../manager/nrw.js";
import Profile from "../pmb/Profile.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'calls';
    this.isLocked = false;
    this.currlist = [];
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chats', 'pmm');
    this.el.innerHTML = `<div class="card-list"></div>`;
    this.chatlist = this.el.querySelector('.card-list');
  }
  writeCalls() {
    const cdb = db.ref.chats;
    const call_keys = Object.keys(cdb).filter(k => {
      const chatCalls = Object.keys(cdb[k].chats).filter(ch => {
        return cdb[k].chats[ch].vc;
      });
      return chatCalls.length >= 1;
    });

    const arr_calls = call_keys.map(k => {
      const chatCalls = Object.keys(cdb[k].chats).filter(ch => {
        return cdb[k].chats[ch].vc;
      });
      const currentCalls = chatCalls.map(ch => {
        return {
          users: cdb[k].users,
          vc: {
            id: ch,
            u: cdb[k].chats[ch].u,
            rj: cdb[k].chats[ch].rj,
            dur: cdb[k].chats[ch].dur,
            ts: cdb[k].chats[ch].ts
          }
        };
      });

      return currentCalls;
    });

    const all_calls = arr_calls.flat(1).sort((a, b) => {
      if(a.vc.ts > b.vc.ts) return 1;
      if(a.vc.ts < b.vc.ts) return -1;
      return 0;
    }).filter(k => {
      return !this.currlist.includes(k.vc.id);
    });
    if(all_calls.length >= 1) {
      all_calls.forEach(ch => {
        this.currlist.push(ch.vc.id);
        const user = ch.users.find(k => k.id !== db.ref.account.id);
        const card = elgen.callCard(ch, user);
        this.chatlist.prepend(card);
        card.onclick = async() => {
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          if(nrw.isNarrow) {
            nrw.setQueue();
            await nrw.destroyPM();
            nrw.fRemovePM();
          }
          new Profile({user}).run();
          userState.locked.bottom = false;
        }
      });
    }
    if(this.currlist.length < 1) {
      const oldnomore = this.chatlist.querySelector('.nomore');
      if(!oldnomore) {
        const nomore = document.createElement('p');
        nomore.classList.add('nomore');
        nomore.innerHTML = `${lang.CHTS_NOCHAT}<br/>${lang.CALL_PLS}`;
        this.chatlist.append(nomore);
      }
    } else {
      const nomore = this.chatlist.querySelector('.nomore');
      if(nomore) nomore.remove();
    }
  }
  forceUpdate() {
    this.writeCalls();
  }
  fRemove() {
    this.currlist = [];
    this.isLocked = false;
    userState.pmmid = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.currlist = [];
      this.isLocked = false;
      userState.pmmid = null;
      userState.pmlast = null;
      resolve();
    });
  }
  run() {
    userState.pmmid = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    userState.pmtitle?.setTitle(lang.APP_CALLS);
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.writeCalls();
  }
}