class userState {
  constructor() {
    this.lang = 'en';
    this.langs = ['id','en'];
    this.color = 'dark';
    this.notif = { a01: 1, a02: 1, a03: 1 };
    this.pmtitle = null;
    this.pmtop = null;
    this.pmmid = null;
    this.pmbottom = null;
    this.pmlast = null;
    this.pmqueue = [];
    this.locked = { top: false, bottom: false, mid: false };
  }
  save() {
    window.localStorage.setItem('kirimin_cache_01', JSON.stringify({
      lang: this.lang,
      color: this.color,
      notif: this.notif
    }));
  }
  getFile() {
    if(!window.localStorage) return null;

    const file = window.localStorage.getItem('kirimin_cache_01');
    return file ? JSON.parse(file) : null;
  }
  load() {
    const file = this.getFile();
    if(file) Object.keys(file).forEach(key => this[key] = file[key]);
  }
}

export default new userState();