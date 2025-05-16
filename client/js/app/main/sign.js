import modal from "../../helper/modal.js";
import xhr from "../../helper/xhr.js";
import cloud from "../../manager/cloud.js";
import userState from "../../manager/userState.js";
import ForceClose from "./ForceClose.js";
import pm from "./pm.js";
let lang = {};

async function langChanger(signMethod) {
  const langlist = [
    {id: 'id', label: 'Bahasa Indonesia'},
    {id: 'en', label: 'English'},
  ]
  const langIndex = langlist.findIndex(llang => llang.id === userState.lang);
  if(langIndex >= 0) langlist[langIndex].actived = true;

  const selLang = await modal.select({
    msg: lang.ACC_CHOOSE_LANG,
    ic: 'globe',
    opt: {
      name: 'language',
      items: langlist
    }
  });
  if(!selLang) return null;
  const { language } = selLang;
  if(language === userState.lang) return null;
  userState.lang = language;
  signMethod.updateString();
  userState.save();

  document.querySelector('html').setAttribute('lang', userState.lang);
  return null;
}

class Sign_Email {
  constructor() {
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'sign');
    this.el.innerHTML = `
    <div class="card">
      <div class="title">
        <h1><img src="./assets/kirimin_icon.png" alt="Kirimin" width="50"/> <span></span></h1>
      </div>
      <div class="language">
        <div class="btn btn-lang">Language<i class="fa-regular fa-chevron-down"></i></div>
      </div>
      <form class="form" action="/login" method="post" id="login-form">
        <div class="field" data-input="signin">
          <div class="input">
            <div class="text">
              <p><label for="email">Email:</label></p>
            </div>
            <input type="email" name="email" id="email" autocomplete="email" placeholder="example@example.com" required="true"/>
          </div>
        </div>
        <div class="field">
          <button type="submit" class="btn-submit"></button>
        </div>
        <div class="field">
          <div class="oldschool">
            <p class="center"><a href="#old-provider"></a></p>
          </div>
        </div>
      </form>
    </div>`;
  }
  updateString() {
    lang = userState.langs[userState.lang];
    const title = this.el.querySelector('.card h1 span');
    title.innerHTML = lang.SIGN_01A;
    const btnSubmit = this.el.querySelector('.btn-submit');
    btnSubmit.innerHTML = lang.SIGN_01B;
    const oldSchool = this.el.querySelector('.oldschool p a');
    oldSchool.innerHTML = lang.SIGN_03;
  }
  langListener() {
    const btnLang = this.el.querySelector('.btn-lang');
    btnLang.onclick = async() => {
      if(this.islocked) return;
      this.islocked = true;
      await langChanger(this);
      this.islocked = false;
    }
  }
  formListener() {
    this.el.querySelector('.oldschool').onclick = async(e) => {
      e.preventDefault();
      if(this.islocked === true) return;
      this.islocked = true;
      await modal.alert({msg:lang.SIGN_HELP_01,ic:'circle-info'});
      this.islocked = false;
    }
    this.form = this.el.querySelector('#login-form');
    this.form.onsubmit = async(e) => {
      e.preventDefault();
      if(this.islocked === true) return;
      this.islocked = true;

      let data = {};
      const formData = new FormData(this.form);
      for(const [key,val] of formData) { data[key] = val }

      const loginReq = await modal.loading(xhr.post('/auth/login', data));
      if(loginReq?.code !== 200) {
        await modal.alert(lang[loginReq.msg] || lang.ERROR);
        this.islocked = false;
        if(loginReq.data?.restart) {
          await this.destroy();
          return this.run();
        }
        return;
      }
      this.islocked = true;
      await this.destroy();
      await modal.alert(lang.AUTH_SUCCESS_01);
      return new Sign_Code({email:loginReq.data.email}).run();
    }
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.islocked = false;
      resolve();
    });
  }
  run() {
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.updateString();
    this.langListener();
    this.formListener();
  }
}

class Sign_Code {
  constructor({ email }) {
    this.isLocked = false;
    this.email = email;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'sign');
    this.el.innerHTML = `
    <div class="card">
      <div class="title">
        <h1><img src="./assets/kirimin_icon.png" alt="Kirimin" width="50"/> <span></span></h1>
      </div>
      <div class="language">
        <div class="btn btn-lang">Language<i class="fa-regular fa-chevron-down"></i></div>
      </div>
      <form class="form" action="/verify" method="post" id="login-form">
        <div class="field" data-input="signin">
          <div class="input">
            <div class="text">
              <p><label for="email">Email:</label></p>
            </div>
            <input type="email" name="email" id="email" autocomplete="email" placeholder="example@example.com" value="${this.email}" readonly="true" required="true" />
          </div>
          <div class="input">
            <div class="text">
              <p><label for="code" class="code-label"></label></p>
              <div class="btn" data-help="signin"><i class="fa-duotone fa-circle-question"></i></div>
            </div>
            <input type="number" class="code" name="code" id="code" min="0" max="999999" placeholder="------" required="true" />
          </div>
        </div>
        <div class="field">
          <button type="submit" class="btn-submit"></button>
        </div>
        <div class="field">
          <div class="oldschool">
            <p class="center"><a href="#old-provider"></a></p>
          </div>
        </div>
      </form>
    </div>`;
  }
  updateString() {
    lang = userState.langs[userState.lang];
    const title = this.el.querySelector('.card h1 span');
    title.innerHTML = lang.SIGN_01A;
    const codeLabel = this.el.querySelector('.code-label');
    codeLabel.innerHTML = lang.SIGN_OTP;
    const btnSubmit = this.el.querySelector('.btn-submit');
    btnSubmit.innerHTML = lang.SIGN_01B;
    const oldSchool = this.el.querySelector('.oldschool p a');
    oldSchool.innerHTML = lang.SIGN_HEAD_BACK;
  }
  langListener() {
    const btnLang = this.el.querySelector('.btn-lang');
    btnLang.onclick = async() => {
      if(this.islocked) return;
      this.islocked = true;
      await langChanger(this);
      this.islocked = false;
    }
  }
  formListener() {
    this.el.querySelector('[data-help]').onclick = async() => {
      if(this.islocked === true) return;
      this.islocked = true;
      await modal.alert(lang.AUTH_SUCCESS_01);
      this.islocked = false;
    }
    this.el.querySelector('.oldschool').onclick = async(e) => {
      e.preventDefault();
      if(this.islocked === true) return;
      this.islocked = true;
      const confirmBack = await modal.confirm({msg:lang.SIGN_HEAD_BACK_CONFIRM});
      if(confirmBack) {
        this.islocked = true;
        await this.destroy();
        return new Sign_Email().run();
      }
      this.islocked = false;
    }
    this.form = this.el.querySelector('#login-form');
    this.form.onsubmit = async(e) => {
      e.preventDefault();
      if(this.islocked === true) return;
      this.islocked = true;

      let data = {};
      const formData = new FormData(this.form);
      for(const [key,val] of formData) { data[key] = val }

      const loginReq = await modal.loading(xhr.post('/auth/verify', data));
      if(loginReq?.code !== 200) {
        await modal.alert(lang[loginReq.msg] || lang.ERROR);
        this.islocked = false;
        if(loginReq.data?.restart) {
          await this.destroy();
          return this.run();
        }
        return;
      }

      this.islocked = false;
      await this.destroy();
      const peerConn = await modal.loading(cloud.run(loginReq.data.cloud.find(ls => ls.name === 'peersinit').data), 'CONNECTING');
      console.log(peerConn);
      if(!peerConn || peerConn.done > 1) {
        return new ForceClose({locale:peerConn.msg,refresh:peerConn.done > 2}).run();
      }
      loginReq.data.cloud.forEach(obj => cloud.clientData(obj));
      if(loginReq.data.first) return new pm().run(true);
      return new pm().run();
    }
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.islocked = false;
      resolve();
    });
  }
  run() {
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.updateString();
    this.langListener();
    this.formListener();
  }
}
export default function() {
  new Sign_Email().run();
}