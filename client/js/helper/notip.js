import elgen from "../manager/elgen.js";

function waittime(ms = 495) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let nindex = 0;
let ndone = 0;
let nshowtime = null;

const cl = { "1": "g", "2": "y", "3": "r", "4": "rb" };

class Notip {
  constructor({ a, b, ic, c, img }) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.ic = ic;
    this.img = img;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('notip');
    this.el.innerHTML = `
    <div class="detail">
      <div class="icon"></div>
      <div class="text">
        <div class="top"></div>
        <div class="bottom"></div>
      </div>
    </div>
    <div class="close btn-close">
      <div class="btn"><i class="fa-solid fa-x"></i></div>
    </div>`;
  }
  writeData() {
    if(this.c) this.el.classList.add(cl[this.c]);

    const eicon = this.el.querySelector('.icon');
    if(this.ic) {
      eicon.innerHTML = '<i class="fa-solid fa-'+this.ic+'"></i>';
    } else if(this.img) {
      eicon.innerHTML = '<img src="'+this.img+'" alt="notip_icon" width="44"/>';
    }
    const etop = this.el.querySelector('.text .top');
    etop.append(elgen.ss(this.a, 20));
    const ebottom = this.el.querySelector('.text .bottom');
    ebottom.append(elgen.ss(this.b, 100));

    const eclose = this.el.querySelector('.btn-close');
    eclose.onclick = () => {
      if(nshowtime) clearTimeout(nshowtime);
      this.destroy();
    }
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await waittime();
      this.el.remove();
      ndone++;
      if(ndone === nindex) {
        ndone = 0;
        nindex = 0;
      }
      nshowtime = null;
      resolve();
    });
  }
  run() {
    this.createElement();
    document.querySelector('.app').append(this.el);
    this.writeData();
    nshowtime = setTimeout(() => {
      this.destroy();
    }, 3995);
  }
}

async function addNotip(s, currIndex) {
  if(ndone + 1 !== currIndex) return setTimeout(() => addNotip(s, currIndex), 250);
  if(nshowtime) {
    clearTimeout(nshowtime);
    nshowtime = null;
  }

  const notip = new Notip(s);
  notip.run();
}


export default function(data) {
  data = Object.assign({}, { a:'', b:'', ic:null, c:null, img:null }, data);
  nindex++;
  addNotip(data, nindex);
}