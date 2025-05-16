import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import xhr from "../../helper/xhr.js";
import { setbadge } from "../../manager/badge.js";
import db from "../../manager/db.js";
import userState from "../../manager/userState.js";
import * as nrw from "../../manager/nrw.js";
import cloud from "../../manager/cloud.js";
const langlist = [
  {id: 'id', label: 'Bahasa Indonesia'},
  {id: 'en', label: 'English'},
]
const colorlist = [
  {id: 'dark', label: 'SET_COLOR_DARK'},
  {id: 'light', label: 'SET_COLOR_LIGHT'},
]
const notiflist = [
  { id: 'a01', label: 'SET_NEW_CHAT' },
  { id: 'a02', label: 'SET_FRIEND_REQ' },
  { id: 'a03', label: 'SET_VCALL' }
]
let lang = {};

export default class Settings {
  constructor({classBefore = null} = {}) {
    this.id = 'settings';
    this.isLocked = false;
    this.classBefore = classBefore;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('pmb', 'acc');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">${lang.APP_SETTINGS}</div>
    </div>
    <div class="wall">
      <div class="chp userlang">
        <div class="outer">
          <div class="chp-t">Language</div>
          <div class="chp-f"><p>Loading</p></div>
          <div class="chp-e btn-lang">Change Language <i class="fa-solid fa-chevron-down"></i></div>
        </div>
      </div>
      <div class="chp usercolor">
        <div class="outer">
          <div class="chp-t">${lang.SET_COLOR}</div>
          <div class="chp-f"><p>Loading</p></div>
          <div class="chp-e btn-color">${lang.SET_CHOOSE_COLOR} <i class="fa-solid fa-chevron-down"></i></div>
        </div>
      </div>
      <div class="chp usernotif">
        <div class="outer">
          <div class="chp-t">${lang.SET_IAP_NOTIF}</div>
          <div class="chp-f"></div>
        </div>
      </div>
      <div class="chp userpush">
        <div class="outer">
          <div class="chp-t">${lang.SET_WEB_PUSH}</div>
          <div class="chp-f"><p>Coming Soon</p></div>
          <div class="chp-n">${lang.SET_ALL_NOTIF}</div>
          <div class="chp-e btn-webpush">${lang.SET_CHANGE_RULE} <i class="fa-solid fa-chevron-down"></i></div>
        </div>
      </div>
    </div>`;
    this.elang = this.el.querySelector('.userlang .outer .chp-f p');
    this.ecolor = this.el.querySelector('.usercolor .outer .chp-f p');
  }
  writeSettings() {
    const enotif = this.el.querySelector('.usernotif .outer .chp-f');

    notiflist.forEach(nf => {
      const ncard = document.createElement('label');
      ncard.setAttribute('for', nf.id);
      ncard.innerHTML = `<i>${lang[nf.label]}</i>`;
      const inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.name = nf.id;
      inp.id = nf.id;
      if(userState.notif[nf.id]) inp.checked = true;
      inp.onchange = () => {
        userState.notif[nf.id] = Number(inp.checked);
        userState.save();
      }
      ncard.append(inp);
      enotif.append(ncard);
    });
  }
  btnListener() {
    this.elang.innerHTML = langlist.find(k => k.id === userState.lang).label;
    this.ecolor.innerHTML = lang[colorlist.find(k => k.id === userState.color).label];
    const btnLang = this.el.querySelector('.btn-lang');
    btnLang.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      const langIndex = langlist.findIndex(llang => llang.id === userState.lang);
      if(langIndex >= 0) langlist[langIndex].actived = true;
  
      const selLang = await modal.select({
        msg: lang.SET_CHOOSE_LANG,
        ic: 'globe',
        opt: {
          name: 'language',
          items: langlist
        }
      });
      if(!selLang) {
        this.isLocked = false;
        return;
      }
      const { language } = selLang;
      if(language === userState.lang) {
        this.isLocked = false;
        return;
      }
      userState.lang = language;
      userState.save();
      document.querySelector('html').setAttribute('lang', userState.lang);

      userState.pmbottom?.el?.remove();
      userState.pmmid?.el?.remove();
      userState.pmtop?.el?.remove();
      document.querySelector('.appname')?.remove();
      await modal.alert(lang.SET_CHOOSE_LANG_DONE);
      cloud.isStopped = 1;
      await modal.loading(new Promise(async resolve => {
          window.location.reload();
          await modal.waittime(1000 * 60);
          resolve();
        }), 'RELOADING'
      )

      this.isLocked = false;
    }
    const btnColor = this.el.querySelector('.btn-color');
    btnColor.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      const colorLocale = colorlist.map(lcolor => {
        return {
          id: lcolor.id,
          label: lang[lcolor.label]
        }
      });
      const colorIndex = colorlist.findIndex(lcolor => lcolor.id === userState.color);
      if(colorIndex >= 0) colorLocale[colorIndex].actived = true;

      const selColor = await modal.select({
        msg: lang.SET_CHOOSE_COLOR,
        ic: 'palette',
        opt: {
          name: 'colortheme',
          items: colorLocale
        }
      });
      if(!selColor) {
        this.isLocked = false;
        return;
      }
      await modal.alert('This -ChooseColorTheme- feature is currently under development')

      this.isLocked = false;
    }
    const btnWebpush = this.el.querySelector('.btn-webpush');
    btnWebpush.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      await modal.alert('This -ChangeWebPushRule- is currently under development');
      this.isLocked = false;
    }

    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        if(this.classBefore) return this.classBefore.run();
        nrw.runQueue();
        nrw.setEmpty();
      }
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
    this.writeSettings();
    this.btnListener();
  }
}