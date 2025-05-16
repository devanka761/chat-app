import modal from "../../helper/modal.js";
import userState from "../../manager/userState.js";
import _navlist from "../pmt/_navlist.js";
import db from "../../manager/db.js";
import appName from "./AppName.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'nav';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('nav');
  }
  getNav() {
    _navlist.forEach(btn => {
      const elnav = document.createElement('div');
      elnav.classList.add('btn', `nav-${btn.id}`);
      // if(userState.pmmid?.id === btn.id) elnav.classList.add('selected');
      if(userState.pmmid?.id === btn.id) {
        elnav.classList.add('selected');
      } else if(!userState.pmmid?.id && btn.id === 'chats') {
        elnav.classList.add('selected');
      }
      elnav.innerHTML = btn.text;
      elnav.querySelector('p').innerText = lang[elnav.querySelector('p').innerText];
      this.el.append(elnav);
      elnav.onclick = async() => {
        appName.optClose();
        if(this.isLocked) return;
        this.isLocked = true;
        let midtop = [userState.pmmid?.id||'none',userState.pmbottom?.id||'none'];
        if(!midtop.includes(btn.id)) {
          if(!btn.noactive) {
            this.el.querySelectorAll('.selected').forEach(elod=>elod.classList.remove('selected'));
            elnav.classList.add('selected');
          }
          await btn.run();
          this.isLocked = false;
        }
        this.isLocked = false;
      }
    });
  }
  setSelection(actid=null) {
    if(!actid) return;
    this.el.querySelectorAll('.selected').forEach(elod=>elod.classList.remove('selected'));
    this.el.querySelector(`.nav-${actid}`).classList.add('selected');
  }
  setUnseen() {
    const gdb = db.ref.groups;
    const ugroups = Object.values(gdb).find(usr => {
      return usr.id !== 'zzz' && Object.values(usr.chats).find(ct => {
        return ct.u.id !== db.ref.account.id && !ct.d && !ct.w?.includes(db.ref.account.id);
      });
    });
    const egroups = this.el.querySelector('.nav-groups');
    if(ugroups) {
      if(!egroups.classList.contains('unseen')) egroups.classList.add('unseen');
    } else {
      if(egroups.classList.contains('unseen')) egroups.classList.remove('unseen');
    }

    const cdb = db.ref.chats;
    const uchats = Object.values(cdb).find(usr => {
      return Object.values(usr.chats).find(ct => {
        return ct.u.id !== db.ref.account.id && !ct.d && !ct.w?.includes(db.ref.account.id);
      })
    });
    const echats = this.el.querySelector('.nav-chats');
    if(uchats) {
      if(!echats.classList.contains('unseen')) echats.classList.add('unseen');
    } else {
      if(echats.classList.contains('unseen')) echats.classList.remove('unseen');
    }

    const ureqs = db.ref.account?.req?.length >= 1;
    const ereqs = this.el.querySelector('.nav-friends');
    if(ureqs) {
      if(!ereqs.classList.contains('unseen')) ereqs.classList.add('unseen');
    } else {
      if(ereqs.classList.contains('unseen')) ereqs.classList.remove('unseen');
    }
  }
  forceUpdate() {
    this.setUnseen();
  }
  fRemove() {
    this.isLocked = false;
    userState.pmtop = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.isLocked = false;
      userState.pmtop = null;
      this.el.remove();
      resolve();
    });
  }
  run() {
    userState.pmtop = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.getNav();
    this.setUnseen();
  }
}