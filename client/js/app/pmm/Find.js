import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import xhr from "../../helper/xhr.js";
import elgen from "../../manager/elgen.js";
import userState from "../../manager/userState.js";
import Profile from "../pmb/Profile.js";
import * as nrw from "../../manager/nrw.js";
import appName from "../pmt/AppName.js";
let lang = {};

export default class {
  constructor() {
    this.id = 'find';
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('chats', 'pmm');
    this.el.innerHTML = `
    <div class="search">
      <p>${lang.FIND_RANDOM}</p>
      <div class="btn btn-random"><i class="fa-solid fa-play"></i> ${lang.FIND_START}</div>
    </div>
    <div class="search">
      <form action="/find/uwu/search-user" class="form form-search-user">
        <p><label for="search_input">${lang.FIND_ID}</label></p>
        <input type="text" name="search_input" id="search_input" placeholder="${lang.TYPE_HERE}" maxLength="30"/>
        <button class="btn"><i class="fa-solid fa-magnifying-glass"></i> ${lang.FIND_SEARCH}</button>
      </form>
    </div>
    <div class="card-list"></div>`;
  }
  btnListener() {
    const form = this.el.querySelector('.form-search-user');
    const inp = this.el.querySelector('#search_input');
    inp.onfocus = () => appName.optClose();
    const cardlist = this.el.querySelector('.card-list');
    setTimeout(() => {
      inp.readOnly = true;
      inp.focus();
      inp.readOnly = false;
    }, 500);
    inp.oninput = () => inp.value = inp.value.replace(/\s/g, '');
    form.onsubmit = async e => {
      e.preventDefault();
      appName.optClose();
      if(this.isLocked === true) return;
      this.isLocked = true;

      if(inp.value.trim().length < 4) {
        await modal.alert(lang.FIND_LENGTH);
        this.isLocked = false;
        return;
      }

      const eloading = document.createElement('div');
      eloading.classList.add('card');
      eloading.innerHTML = `<div class="getload"><div class="spinner"><i class="fa-solid fa-spinner fa-spin"></i></div>LOADING</div>`;
      cardlist.prepend(eloading);

      const getSearch = await xhr.get('/find/uwu/search-user?id='+inp.value);
      eloading.remove();
      if(!getSearch || getSearch.code !== 200) {
        await modal.alert(lang[getSearch.msg]);
        this.isLocked = false;
        return;
      }
      if(getSearch.data.users.length < 1) {
        await modal.alert(lang.FIND_NOTFOUND);
        this.isLocked = false;
        return;
      }

      cardlist.innerHTML = '';
      inp.value = '';
      getSearch.data.users.forEach(usr => {
        const card = elgen.findCard(usr);
        cardlist.append(card);
        this.isLocked = false;
        card.onclick = async() => {
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          if(nrw.isNarrow) {
            nrw.setQueue();
            await nrw.destroyPM();
            nrw.fRemovePM();
          }
          new Profile({user:usr}).run();
          userState.locked.bottom = false;
        }
      });
    }
    const btnRandom = this.el.querySelector('.btn-random');
    btnRandom.onclick = async() => {
      appName.optClose();
      if(this.isLocked === true) return;
      this.isLocked = true;

      const eloading = document.createElement('div');
      eloading.classList.add('card');
      eloading.innerHTML = `<div class="getload"><div class="spinner"><i class="fa-solid fa-spinner fa-spin"></i></div>LOADING</div>`;
      cardlist.prepend(eloading);
      
      await modal.waittime();
      const getRandom = await xhr.get('/find/uwu/search-random');
      eloading.remove();
      if(getRandom?.code !== 200) {
        await modal.alert(lang[getRandom.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }

      cardlist.innerHTML = '';
      inp.value = '';
      getRandom.data.users.forEach(usr => {
        const card = elgen.findCard(usr);
        cardlist.append(card);
        this.isLocked = false;
        card.onclick = async() => {
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          if(nrw.isNarrow) {
            nrw.setQueue();
            await nrw.destroyPM();
            nrw.fRemovePM();
          }
          new Profile({user:usr}).run();
          userState.locked.bottom = false;
        }
      });
    }
  }
  fRemove() {
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
    userState.pmtitle?.setTitle(lang.APP_SEARCH);
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.btnListener();
  }
}