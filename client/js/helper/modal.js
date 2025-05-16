import userState from "../manager/userState.js";
let lang = {};

export default {
  async waittime(ms = 495) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  async loading(newfunc, msg = 'LOADING') {
    const el = document.createElement('div');
    el.classList.add('loading');
    el.innerHTML = `
    <div class="box">
      <div class="spinner">
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>
      <p>${msg}</p>
    </div>`;
    document.querySelector('.app').append(el);

    await this.waittime();

    return await newfunc.then(async res => {
      el.classList.add('out');
      await this.waittime();
      el.remove();
      return res;
    }).catch(async err => {
      el.classList.add('out');
      await this.waittime();
      el.remove();
      return err;
    });
  },
  async waiting(newfunc, msg = 'WAITING') {
    const el = document.createElement('div');
    el.classList.add('waiting');
    el.innerHTML = `
    <div class="box">
      <p>${msg}</p>
    </div>`;

    document.querySelector('.app').append(el);
    await this.waittime();
    return await newfunc.then(async res => {
      el.classList.add('out');
      await this.waittime();
      el.remove();
      return res;
    }).catch(async err => {
      el.classList.add('out');
      await this.waittime();
      el.remove();
      return err;
    });
  },
  element() {
    lang = userState.langs[userState.lang];
    const el = document.createElement('div');
    el.classList.add('modal');
    return el;
  },
  alert(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.ic ? s.ic:'circle-exclamation'}"></i>
        </div>
        <div class="messages"><p>${typeof(s) === 'string' ? (s || '') : (s.msg || '')}</p></div>
        <div class="action">
          <button class="btn btn-ok" role="button">OK</button>
        </div>
      </div>`;
      
      if(s.img) {
        const img = new Image();
        img.src = s.img;
        el.querySelector('.box .messages').append(img);
        img.onerror = async() => {
          el.classList.add('out');
          await this.waittime();
          el.remove();
          return resolve(await this.alert({msg:lang.IMG_ERR,ic:'image-slash'}));
        }
      }

      const btn = el.querySelector('.action .btn-ok');
      if(s.okx) btn.innerText = s.okx;

      document.querySelector('.app').append(el);
      btn.focus();

      btn.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(false);
        if(s.ok) s.ok();
      }
    });
  },
  confirm(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.ic ? s.ic:'circle-exclamation'}"></i>
        </div>
        <div class="messages"><p>${typeof(s) === 'string' ? (s || '') : (s.msg || '')}</p></div>
        <div class="actions">
          <button class="btn btn-cancel" role="button">${lang.CANCEL}</button>
          <button class="btn btn-ok" role="button">OK</button>
        </div>
      </div>`;
      
      if(s.img) {
        const img = new Image();
        img.src = s.img;
        el.querySelector('.box .messages').append(img);
        img.onerror = async() => {
          el.classList.add('out');
          await this.waittime();
          el.remove();
          return resolve(await this.alert({msg:lang.IMG_ERR,ic:'image-slash'}));
        }
      }

      const btnOk = el.querySelector('.actions .btn-ok');
      if(s.okx) btnOk.innerText = s.okx;
      const btnCancel = el.querySelector('.actions .btn-cancel');
      if(s.cancelx) btnCancel.innerText = s.cancelx;

      document.querySelector('.app').append(el);
      btnOk.focus();

      btnOk.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(true);
        if(s.ok) s.ok();
      }
      btnCancel.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(false);
        if(s.cancel) s.cancel();
      }
    });
  },
  prompt(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.ic ? s.ic:'circle-exclamation'}"></i>
        </div>
        <div class="messages">
          <p><label for="prompt-field">${typeof(s) === 'string' ? (s || '') : (s.msg || '')}</label></p>
          ${s.tarea ? `<textarea name="prompt-field" id="prompt-field" maxlength="${s.max ? s.max : '300'}" placeholder="${s.pholder || lang.TYPE_HERE}">${s.val || ''}</textarea>` : `<input type="text" name="prompt-field" id="prompt-field" autocomplete="off" maxlength="${s.max ? s.max : '100'}" placeholder="${s.pholder || lang.TYPE_HERE}"/>`}
        </div>
        <div class="actions">
          <button class="btn btn-cancel" role="button">${lang.CANCEL}</button>
          <button class="btn btn-ok" role="button">OK</button>
        </div>
      </div>`;

      if(s.img) {
        const img = new Image();
        img.src = s.img;
        el.querySelector('.box .messages').append(img);
        img.onerror = async() => {
          el.classList.add('out');
          await this.waittime();
          el.remove();
          return resolve(await this.alert({msg:lang.IMG_ERR,ic:'image-slash'}));
        }
      }

      const btnOk = el.querySelector('.actions .btn-ok');
      if(s.okx) btnOk.innerText = s.okx;
      const btnCancel = el.querySelector('.actions .btn-cancel');
      if(s.cancelx) btnCancel.innerText = s.cancelx;

      const input = el.querySelector('.box .messages #prompt-field');
      if(s.iregex) input.oninput = () => input.value = input.value.replace(s.iregex, '');

      document.querySelector('.app').append(el);
      input.focus();
      if(s.val) input.value = s.val;

      btnOk.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(input.value);
        if(s.ok) s.ok();
      }
      btnCancel.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(null);
        if(s.cancel) s.cancel();
      }
      input.onkeydown = e => {
        if(e.key.toLowerCase() === 'enter') {
          e.preventDefault();
          btnOk.click();
        }
      }
    });
  },
  select(s) {
    return new Promise(resolve => {
      const el = this.element();
      el.innerHTML = `
      <div class="box">
        <div class="icons">
          <i class="fa-duotone fa-${s.ic ? s.ic:'circle-exclamation'}"></i>
        </div>
        <div class="messages">
          <p>${typeof(s) === 'string' ? (s || '') : (s.msg || '')}</p>
          <form class="radioform" id="radioform">
          </form>
        </div>
        <div class="actions">
          <div class="btn btn-cancel" role="button">${lang.CANCEL}</div>
          <div class="btn btn-ok" role="button">OK</div>
        </div>
      </div>`;
      const input = el.querySelector('.box .messages #radioform');
      s.opt.items.forEach(opt => {
        const radio = document.createElement('div');
        radio.classList.add('radio');
        radio.innerHTML = `<label for="${s.opt.name}-${opt.id}"><input type="radio" name="${s.opt.name}" id="${s.opt.name}-${opt.id}" value="${opt.id}" required /><p>${opt.label}</p></label>`;
        if(opt.actived) radio.querySelector('input').checked = true;
        input.append(radio);
      });

      if(s.img) {
        const img = new Image();
        img.src = s.img;
        el.querySelector('.box .messages').append(img);
        img.onerror = async() => {
          el.classList.add('out');
          await this.waittime();
          el.remove();
          return resolve(await this.alert({msg:lang.IMG_ERR,ic:'image-slash'}));
        }
      }

      const btnOk = el.querySelector('.actions .btn-ok');
      if(s.okx) btnOk.innerText = s.okx;
      const btnCancel = el.querySelector('.actions .btn-cancel');
      if(s.cancelx) btnCancel.innerText = s.cancelx;

      if(s.iregex) input.oninput = () => input.value = input.value.replace(s.iregex, '');

      document.querySelector('.app').append(el);
      input.focus();

      btnOk.onclick = async() => {
        let data = {};
        const formData = new FormData(input);
        for(const [key, val] of formData) { data[key] = val };
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(data);
        if(s.ok) s.ok();
      }
      btnCancel.onclick = async() => {
        el.classList.add('out');
        await this.waittime();
        el.remove();
        resolve(null);
        if(s.cancel) s.cancel();
      }
    });
  }
}