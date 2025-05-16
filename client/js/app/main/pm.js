import Nav from "../pmt/Nav.js";
import appName from "../pmt/AppName.js";
import Chats from "../pmm/Chats.js";
import Empty from "../pmb/Empty.js";
import Account from "../pmb/Account.js";
import * as nrw from "../../manager/nrw.js";
import ForceClose from "./ForceClose.js";
import Content from "../pmb/Content.js";
import db from "../../manager/db.js";

export default class {
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('fuwi', 'pm');
  }
  async renderSects() {
    const params = new URL(window.location.href).searchParams;
    if(params.get('r')) {
      if(params.get('link') && params.get('type')) {
        return this.sendRedirect(`/invite/${params.get('type')||'g'}/${params.get('link')}`);
      }
    }

    new Nav().run();
    appName.run();
    new Chats().run();
    if(params.get('c')) {
      if(params.get('type') === 'g' && params.get('id')) {
        const user = db.ref.groups[params.get('id')];
        if(!user) return this.normalPM();
        return this.funcPM(new Content({user, conty:2}));
      }
    }

    this.normalPM();
  }
  async funcPM(newfunc) {
    if(nrw.isNarrow) {
      nrw.setQueue();
      await nrw.destroyPM();
      nrw.fRemovePM();
    }
    return newfunc.run();
  }
  async normalPM() {
    if(this.isfirst) {
      if(nrw.isNarrow) {
        nrw.setQueue();
        await nrw.destroyPM();
        nrw.fRemovePM();
      }
      new Account().run();
    } else {
      if(nrw.isNarrow) {
        nrw.setEmpty();
      } else {
        new Empty().run();
      }
    }
  }
  async sendRedirect(newhref) {
    new ForceClose({locale:'REDIRECTING'}).run();
    setTimeout(() => window.location.href = newhref, 150);
  }
  run(isfirst = false) {
    this.isfirst = isfirst;
    this.createElement();
    document.querySelector('.app').append(this.el);
    nrw.windowresize();
    this.renderSects();
  }
}