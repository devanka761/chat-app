import userState from "../../manager/userState.js";
import Account from "../pmb/Account.js";
import modal from "../../helper/modal.js";
import * as nrw from "../../manager/nrw.js";
import Settings from "../pmb/Settings.js";
let lang = {};

class AppName {
  constructor() {
    this.id = 'appname';
    this.isLocked = false;
    this.optOpened = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('appname');
    this.el.innerHTML = `
    <div class="title">KIRIMIN</div>
    <div class="actions">
      <div class="btn btn-find"><i class="fa-solid fa-fw fa-magnifying-glass"></i></div>
      <div class="btn btn-settings"><i class="fa-solid fa-fw fa-ellipsis-vertical"></i></div>
    </div>`;
  }
  btnListener() {
    const btnSettings = this.el.querySelector('.btn-settings');
    btnSettings.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;

      if(this.optOpened) {
        await this.optClose();
        this.isLocked = false;
        return;
      }
      this.optOpen();
      this.isLocked = false;
      return;
    }
    const btnFind = this.el.querySelector('.btn-find');
    btnFind.onclick = async() => {
      const navFind = document.querySelector('.nav-find');
      if(navFind) navFind.click();
    }
  }
  setTitle(newtitle) {
    if(this.el) this.el.querySelector('.title').innerHTML = newtitle;
  }
  optOpen() {
    this.optOpened = true;
    this.elopt = document.createElement('div');
    this.elopt.classList.add('appname-options');

    const options = [
      { id: 'account', html: `<i class="fa-solid fa-fw fa-user"></i> ${lang.APP_ACCOUNT}`, init: new Account() },
      { id: 'settings', html: `<i class="fa-solid fa-fw fa-gear"></i> ${lang.APP_SETTINGS}`, init: new Settings() }
    ]
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.classList.add('btn');
      btn.innerHTML = opt.html;
      btn.onclick = async() => {
        this.optClose();
        if(userState.pmbottom?.id === opt.init.id) return;
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        if(nrw.isNarrow) {
          nrw.setQueue();
          await nrw.destroyPM();
          nrw.fRemovePM();
        }
        opt.init.run();
        userState.locked.bottom = false;
      };
      this.elopt.append(btn);
    });
    this.el.append(this.elopt);
  }
  async optClose() {
    if(!this.elopt) {
      this.optOpened = false;
      return;
    }
    this.elopt.classList.add('out');
    await modal.waittime(245);
    this.elopt.remove();
    this.optOpened = false;
    return;
  }
  fRemove() {
    this.isLocked = false;
    this.optOpened = false;
    userState.pmtitle = null;
    this.el.remove();
    if(this.elopt) this.elopt.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.optClose();
      this.el.classList.add('out');
      await modal.waittime();
      this.isLocked = false;
      this.optOpened = false;
      userState.pmtitle = null;
      this.el.remove();
      resolve();
    })
  }
  run() {
    userState.pmtitle = this;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    this.btnListener();
  }
}

export default new AppName();