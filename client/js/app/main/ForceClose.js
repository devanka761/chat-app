import userState from "../../manager/userState.js";

export default class {
  constructor({ locale=null, refresh=0 } = { locale }) {
    this.locale = locale;
    this.refresh = refresh;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('forceclose');
    this.el.innerHTML = '<div class="summary"></div>';
  }
  clearAll() {
    userState.pmbottom?.el?.remove();
    userState.pmmid?.el?.remove();
    userState.pmtop?.el?.remove();
    document.querySelector('.appname')?.remove();
    document.querySelector('.app .pm')?.remove();
  }
  async writeData() {
    const p1 = document.createElement('p');
    p1.append(userState.langs['en'][this.locale]);
    const p2 = document.createElement('p');
    p2.append(userState.langs['id'][this.locale]);
    const summary = this.el.querySelector('.summary');
    summary.append(p1, p2);

    if(this.refresh) {
      const actfield = document.createElement('div');
      actfield.classList.add('action');
      actfield.innerHTML = '<div class="btn btn-refresh"><i class="fa-solid fa-rotate-left"></i></div>';
      actfield.onclick = () => {
        p1.remove();
        p2.remove();
        summary.innerHTML = '<i style="font-size:3rem" class="fa-duotone fa-spinner-third fa-spin"></i>';
        actfield.remove();
        setTimeout(() => {
          window.location.reload();
          self.location.reload();
          location.reload();
        }, 200);
      }
      summary.appendChild(actfield);
    }
  }
  run() {
    this.lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app').appendChild(this.el);
    this.clearAll();
    this.writeData();
  }
}