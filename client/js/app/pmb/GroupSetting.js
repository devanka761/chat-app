import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import xhr from "../../helper/xhr.js";
import db from "../../manager/db.js";
import elgen from "../../manager/elgen.js";
import userState from "../../manager/userState.js";
import Empty from "./Empty.js";
import Profile from "./Profile.js";
import * as nrw from "../../manager/nrw.js";
import { copyToClipboard } from "../../helper/utils.js";
let lang = {};

export default class {
  constructor({group, classBefore = null} = { group }) {
    this.id = 'group_setting';
    this.group = group;
    this.classBefore = classBefore;
    this.isLocked = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('acc', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="sect-title">Groups</div>
    </div>
    <div class="wall">
      <div class="chp userphoto">
        <div class="outer-img">
          <img src="/assets/group.jpg" alt="${this.group.id}"/>
          ${this.group.o === db.ref.account.id ? '<div class="btn btn-img"><i class="fa-solid fa-pen-to-square"></i></div>' : ''}
        </div>
      </div>
      <div class="chp groupname">
        <div class="outer">
          <div class="chp-t">Group Name</div>
          <div class="chp-f"><p>Loading</p></div>
          ${this.group.o === db.ref.account.id ? '<div class="chp-e btn-groupname"><i class="fa-solid fa-pen-to-square"></i> Edit</div>' : ''}
        </div>
      </div>
      <div class="chp groupid">
        <div class="outer">
          <div class="chp-t">Group ID</div>
          <div class="chp-f"><p>${this.group.id.toUpperCase()}</p></div>
        </div>
      </div>
      <div class="chp groupinvite">
        <div class="outer">
          <div class="chp-t">Group Invite Link</div>
          <div class="chp-f">
            <p class="type">Loading</p>
          </div>
        </div>
      </div>
      <div class="chp groupmember">
        <div class="outer">
          <div class="chp-t">Members</div>
          <div class="chp-u"><ul><li>Loading</li></ul></div>
        </div>
      </div>
      <div class="chp usersign">
        <p><a class="btn-delete" href="#delete-group"><i class="fa-light fa-triangle-exclamation"></i> ${this.group.o === db.ref.account.id ? lang.GRPS_DELETE : lang.GRPS_LEAVE}</a></p>
      </div>
    </div>`;
  }
  async writeGroup() {
    this.gimg = this.el.querySelector('.userphoto .outer-img');
    this.gname = this.el.querySelector('.groupname .chp-f p');
    this.gname.innerText = this.group.n;
    
    this.gid = this.el.querySelector('.groupid .chp-f p');
    this.gid.innerHTML = this.group.id.toUpperCase();
    this.gmember = this.el.querySelector('.groupmember .chp-u ul');
    this.gmember.innerHTML = '';

    const oimg = this.gimg.querySelector('img');
    if(oimg) oimg.remove();
    const img = new Image();
    img.onerror = () => img.src = '/assets/group.jpg';
    img.alt = this.group.id;
    img.src = this.group.i ? `/file/group/${this.group.i}` : '/assets/group.jpg';
    this.gimg.prepend(img);

    const _group = await modal.loading(xhr.get('/group/uwu/detail/' + this.group.id));
    if(_group && _group.code === 200) {
      Object.keys(_group.data).forEach(k => {
        this.group[k] = _group.data[k];
        db.ref.groups[_group.data.id][k] = _group.data[k];
      });
      userState.pmmid?.forceUpdate?.();
      userState.pmtop?.forceUpdate?.();
    }

    this.renderDetail();
    this.btnListener();
  }
  renderDetail() {
    this.gname.innerText = this.group.n;
    this.gid.innerHTML = this.group.id.toUpperCase();

    const sectInvite = this.el.querySelector('.groupinvite');
    if(this.group.o === db.ref.account.id) {
      sectInvite.innerHTML = `
      <div class="outer">
        <div class="chp-t">Group Invite Link</div>
        <div class="chp-f">
          <p class="type">Private</p>
          <p class="link"><a href="${window.location.origin}/invite/g/${this.group.l}" target="_blank">${window.location.origin}/invite/g/${this.group.l}</a></p>
        </div>
        <div class="chp-e btn-type">Change Group Invite <i class="fa-solid fa-chevron-down"></i></div>
      </div>`;
      this.gtype = this.el.querySelector('.groupinvite .chp-f p.type');
      this.gtype.innerHTML = this.group.t === '1' ? 'Private' : 'Public';
      this.glink = this.el.querySelector('.groupinvite .chp-f p.link');
    } else if(this.group.t) {
      sectInvite.innerHTML = `
      <div class="outer">
        <div class="chp-t">Group Invite Link</div>
        <div class="chp-f">
          <p class="type">${this.group.t === '1' ? 'Private' : 'Public'}</p>
          ${this.group.t === '1' ? '' : '<p class="link"><a href="' + window.location.origin + '/invite/g/' + this.group.l + '" target="_blank">' + window.location.origin + '/invite/g/' + this.group.l + '</a></p>'}
        </div>
      </div>`;
      this.glink = this.el.querySelector('.groupinvite .chp-f p.link');
    }

    this.group.users.forEach(usr => {
      const card = elgen.groupMemberCard(usr, this.group.o);
      if(usr.id === db.ref.account.id) this.gmember.prepend(card);
      else this.gmember.append(card);
      card.querySelector('.left').onclick = async() => {
        if(usr.id === db.ref.account.id) return;
        if(userState.locked.bottom) return;
        userState.locked.bottom = true;
        await userState.pmbottom?.destroy?.();
        new Profile({user:{...usr}}).run();
        userState.locked.bottom = false;
      }
      const btnKick = card.querySelector('.right .btn-kick');
      if(btnKick) btnKick.onclick = async() => {
        if(this.isLocked) return;
        this.isLocked = true;
        const kickConfirm = await modal.confirm(lang.GRPS_KICK_CONFIRM.replace('{uname}', usr.username));
        if(!kickConfirm) {
          this.isLocked = false;
          return;
        }
        const setKick = await modal.loading(xhr.post('/group/uwu/kick-member', {gid:this.group.id, id:usr.id}));
        if(setKick?.code !== 200) {
          await modal.alert(lang.ERROR);
          this.isLocked = false;
          return;
        }

        const gdb = db.ref.groups[this.group.id];
        if(gdb) db.ref.groups[this.group.id].users = gdb.users.filter(k => k.id !== setKick.data.user.id);
        card.remove();
        this.isLocked = false;
      }
    });
  }
  btnListener() {
    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        if(this.classBefore) return this.classBefore.run();
        nrw.runQueue();
        nrw.setEmpty();
      }
    }

    const btnDelete = this.el.querySelector('a.btn-delete');
    btnDelete.onclick = async e => {
      e.preventDefault();
      if(this.isLocked) return;
      this.isLocked = true;
      const cDelete = await modal.confirm(this.group.o === db.ref.account.id ? lang.GRPS_DELETE : lang.GRPS_LEAVE);
      if(!cDelete) {
        this.isLocked = false;
        return;
      }

      const setDelete = await modal.loading(xhr.post('/group/uwu/del-group', {id:this.group.id}));
      if(setDelete?.code !== 200) {
        await modal.alert(lang[setDelete.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }

      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      delete db.ref.groups[this.group.id];
      elgen.delCard(this.group.id);
      if(nrw.isNarrow) {
        nrw.runQueue();
        nrw.setEmpty();
      } else {
        new Empty().run();
      }
      userState.pmlast = userState.pmmid?.id || 'chats';
      userState.locked.bottom = false;
      this.isLocked = false;
      userState.pmmid?.forceUpdate?.();
    }

    const btnGname = this.el.querySelector('.btn-groupname');
    if(btnGname) btnGname.onclick = async() => {
      if(this.isLocked === true) return;
      this.isLocked = true;
      const getGname = await modal.prompt({
        ic: 'marker', max: 45,
        msg: lang.GRPS_DNAME,
        val: this.group.n,
        iregex: /(\s)(?=\s)/g
      });
      if(!getGname) {
        this.isLocked = false;
        return;
      }
      if(getGname === this.group.n) {
        this.isLocked = false;
        return;
      }
      const setGname = await modal.loading(xhr.post('/group/uwu/set-groupname', {id:this.group.id, gname:getGname}));
      if(setGname?.code === 429) {
        await modal.alert(`${lang.GRPS_DNAME_COOLDOWN}<br/><b>${new Date(setGname.msg).toLocaleString()}</b>`);
        this.isLocked = false;
        return;
      }
      if(!setGname || setGname.code !== 200) {
        await modal.alert(lang[setGname.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }

      db.ref.groups[this.group.id].n = setGname.data.text;
      this.group.n = setGname.data.text;

      this.gname.innerText = setGname.data.text;
      this.isLocked = false;
      userState.pmmid?.forceUpdate?.();
    };

    const btnImg = this.el.querySelector('.btn-img');
    if(btnImg) btnImg.onclick = () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*';
      inp.onchange = async() => {
        if(this.isLocked === true) return;
        this.isLocked = true
        const file = inp.files[0];
        let tempsrc = URL.createObjectURL(file);
        const getImg = await modal.confirm({
          ic: 'circle-question',
          msg: lang.GRPS_IMG,
          img: tempsrc
        });
        if(!getImg) {
          this.isLocked = false;
          return;
        }
        const imgsrc = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            return resolve(reader.result);
          }
          reader.readAsDataURL(file);
        });

        const setImg = await modal.loading(xhr.post('/group/uwu/set-img', {id:this.group.id,img:imgsrc,name:file.name}, '.loading .box p'), lang.UPLOADING);
        if(setImg?.code !== 200) {
          await modal.alert(lang.ACC_FILE_LIMIT.replace(/{SIZE}/g, '2.5MB'));
          this.isLocked = false;
          return;
        }
        if(setImg?.code !== 200) {
          await modal.alert(lang[setImg.msg] || lang.ERROR);
          this.isLocked = false;
          return;
        }
        this.gimg.querySelector('img').remove();
        const img = new Image();
        img.src = tempsrc;
        this.gimg.prepend(img);

        this.isLocked = false;
        return;
      }
      inp.click();
    };
    const btnType = this.el.querySelector('.btn-type');
    if(btnType) btnType.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;

      const typelist = [
        {id: '0', label: lang.GRPS_TYPE_0},
        {id: '1', label: lang.GRPS_TYPE_1},
      ]

      const typeIndex = typelist.findIndex(ltype => ltype.id === this.group.t);
      if(typeIndex >= 0) typelist[typeIndex].actived = true;

      const getType = await modal.select({
        msg: lang.GRPS_TYPE,
        ic: 'house-lock',
        opt: {
          name: 'type',
          items: typelist
        }
      });
      if(!getType) {
        this.isLocked = false;
        return;
      }

      const setType = await modal.loading(xhr.post('/group/uwu/set-type', {id:this.group.id, t: getType.type}));

      if(setType?.code !== 200) {
        await modal.alert(lang[setType.msg] || lang.ERROR);
        this.isLocked = false;
        return;
      }

      this.group.t = setType.data.text;
      this.group.l = setType.data.link;
      if(this.gtype) this.gtype.innerText = setType.data.text === '1' ? 'Private' : 'Public';
      if(this.glink) this.glink.innerHTML = `<a href="${window.location.origin}/invite/g/${setType.data.link}" target="_blank">${window.location.origin}/invite/g/${setType.data.link}</a>`;
      this.isLocked = false;
    };
    if(this.glink) this.glink.onclick = async e => {
      e.preventDefault();
      const invlink = `${window.location.origin}/invite/g/${this.group.l}`;
      const copyText = await copyToClipboard(invlink);
      if(copyText.ok) {
        const copySuccess = lang.COPY_TEXT;
        await modal.alert({ ic: 'clipboard-check', msg: copySuccess.replace(/{TEXT}/g, invlink)});
      } else {
        await modal.alert('No Permission');
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
    this.writeGroup();
  }
}