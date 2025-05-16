import modal from "../../helper/modal.js";
import sceneIn from "../../helper/sceneIn.js";
import sdate from "../../helper/sdate.js";
import validatext from "../../helper/validatext.js";
import xhr from "../../helper/xhr.js";
import { setbadge } from "../../manager/badge.js";
import cloud from "../../manager/cloud.js";
import db from "../../manager/db.js";
import elgen from "../../manager/elgen.js";
import userState from "../../manager/userState.js";
import GroupSetting from "./GroupSetting.js";
import Profile from "./Profile.js";
import * as nrw from "../../manager/nrw.js";
import { checkCall, checkMedia, SendCall } from "../call/Call.js";
let lang = null;

let recorder = null;
let recorderChunks = [];
let isrecording = false;
let stoprecord = false;
let recordinterval = null;
let renderedData = false;
let mediaStream = null;

export default class {
  constructor({ user, conty }) {
    this.id = 'content';
    this.conty = conty;
    this.user = user;
    this.isLocked = false;
    this.chatcount = 0;
    this.contents = {
      text:null,
      rep:null,
      voice:{ src:null, blob:null },
      file:{ name:null, src:null, blob:null }
    };
    this.planesend = false;
    this.downed = new Set();
    this.disabelAutoScroll = false;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('content', 'pmb');
    this.el.innerHTML = `
    <div class="top">
      <div class="left">
        <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
        <div class="user">
          <div class="img"></div>
          <div class="name"><p></p></div>
        </div>
      </div>
      <div class="right">
        <div class="btn btn-video">
          <i class="fa-solid fa-video"></i>
        </div>
        <div class="btn btn-call">
          <i class="fa-solid fa-phone"></i>
        </div>
        <div class="btn btn-more">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </div>
      </div>
    </div>
    <div class="mid">
      <div class="chatlist"></div>
    </div>
    <div class="bottom">
      <div class="field">
        <div class="input">
          <div class="emoji">
            <div class="btn btn-emoji">
              <i class="fa-solid fa-face-smile"></i>
            </div>
          </div>
          <div class="textbox">
            <textarea name="content-input" id="content-input" maxlength="500" placeholder="Type Here"></textarea>
          </div>
          <div class="actions">
            <div class="btn btn-attach">
              <i class="fa-solid fa-paperclip"></i>
            </div>
            <div class="btn btn-image">
              <i class="fa-solid fa-camera-retro"></i>
            </div>
          </div>
        </div>
        <div class="voice">
          <div class="btn btn-voice">
            <i class="fa-solid fa-microphone"></i>
          </div>
        </div>
      </div>
    </div>`;
    this.chatlist = this.el.querySelector('.mid .chatlist');
    this.bottomclass = this.el.querySelector('.bottom');
    this.midclass = this.el.querySelector('.mid');
    this.topclass = this.el.querySelector('.top');
  }
  updateUser() {
    if(this.conty === 1) {
      this.user.chat_id = Object.values(db.ref.chats || {}).find(ch => ch.users.find(usr => usr.id === this.user.id))?.id || null;
      if(!this.user.username) this.user.username = userState.langs[userState.lang].DELETED_USER;
      const profileData = {};
      Object.keys(this.user).forEach(k => {
        if(['id', 'username', 'displayName', 'bio', 'peer', 'myreq', 'theirreq', 'isfriend', 'b']) {
          profileData[k] = this.user[k];
        }
      });
      this.user.prof = new Profile({user:profileData,classBefore:this});
    } else if(this.conty === 2) {
      this.user.chat_id = this.user.id;
      this.user.prof = new GroupSetting({group:{...this.user},classBefore:this});
      this.user.username = this.user.n;
      this.user.img = this.user.i;
      this.user.prof = new GroupSetting({group:{...this.user},classBefore:this});
    }

    const euname = this.el.querySelector('.top .left .user .name p');
    if(elgen.ss(this.user.username, 15) !== euname.innerText) {
      euname.innerHTML = '';
      euname.append(elgen.ss(this.user.username, 15));
      if(this.user.b) {
        for(const badge of this.user.b.sort((a,b) => b - a)) {
          euname.append(setbadge(badge));
        }
      }
    }

    const oldimg = this.el.querySelector('.top .left .user .img img');
    const dbimg = this.user.img;
    if(dbimg) {
      if(!oldimg || !oldimg.src.includes(dbimg)) {
        const img = new Image();
        img.onerror = () => img.src = this.conty === 1 ? '/assets/user.jpg' : '/assets/group.jpg';
        img.onload = () => oldimg?.remove();
        img.src = this.conty === 1 ? `/file/user/${dbimg}` : `/file/group/${dbimg}`;
        this.el.querySelector('.top .left .user .img').appendChild(img);
      }
    } else {
      if(!oldimg) {
        const img = new Image();
        img.onerror = () => img.src = this.conty === 1 ? '/assets/user.jpg' : '/assets/group.jpg';
        img.src = this.conty === 1 ? '/assets/user.jpg' : '/assets/group.jpg';
        this.el.querySelector('.top .left .user .img').appendChild(img);
      }
    }
  }
  setReadChat() {
    const csu = chatSelection(this.user, this.conty);
    this.user = {...this.user, ...csu};

    const ckey = this.conty === 1 ? 'chats' : 'groups';
    
    if(this.user.chat_id) {
      const chat_id = this.user.chat_id;
      const cdb = Object.values(db.ref[ckey]).find(ck => ck.id === chat_id);
      cloud.peer.socket._socket.send(JSON.stringify({d761: {id:"readMsg", data:{id:this.user.chat_id}}}))
      Object.keys(db.ref[ckey][chat_id].chats).forEach(k => {
        const curr_chat = db.ref[ckey][chat_id].chats[k];
        if(!curr_chat.w) curr_chat.w = [];
        if(!curr_chat.w.includes(db.ref.account.id)) {
          db.ref[ckey][chat_id].chats[k].w.push(db.ref.account.id);
        }
      });
      userState.pmmid?.forceUpdate?.();
      userState.pmtop?.forceUpdate?.();
      let peers = cdb?.users.filter(usr => usr.peer)?.map(usr => usr.peer) || [];
      cloud.send({ "id": "read-msg", "to": peers });
    }
  }
  renderChats() {
    const ckey = this.conty === 1 ? 'chats' : 'groups';
    const cdb = Object.values(db.ref[ckey] || {}).find(ck => ck.id === (this.user?.chat_id || Date.now().toString(32))) || [];

    const eluname = this.el.querySelector('.top .left .user .name p');
    if(elgen.ss(this.user.username, 15) !== eluname.innerText) {
      eluname.innerText = elgen.ss(this.user.username, 15);
      if(this.user.b) {
        for(const badge of this.user.b.sort((a,b) => b - a)) {
          eluname.append(setbadge(badge));
        }
      }
    }

    const fdb = Object.values(cdb.chats || {}).sort((a, b) => {
      if(a.ts < b.ts) return -1;
      if(a.ts > b.ts) return 1;
      return 0;
    });

    fdb.forEach(ch => {
      const {card, uc} = elgen.contentCard(ch, this.user, this.conty);
      card.onclick = async e => {
        const elsender = card.querySelector('.sender .name');
        const elvoice = card.querySelector('.voice');
        const elrep = card.querySelector('.embed');
        const eldoc = card.querySelector('.document');
        if(elsender?.contains(e.target) && ch.u.id !== db.ref.account.id) {
          if(ch.u.code || !ch.u.id) return modal.alert(lang.PROF_DELETED_USER);
          if(userState.locked.bottom) return;
          userState.locked.bottom = true;
          await userState.pmbottom?.destroy?.();
          userState.locked.bottom = false;
          return new Profile({user:{...ch.u}}).run();
        } else if(card.classList.contains('deleted') || card.classList.contains('voice-call')) {
          return;
        } else if(elrep?.contains(e.target)) {
          if(this.isLocked) return;
          this.isLocked = true;
          const endID = elrep.getAttribute('data-rep');
          const eldestination = this.chatlist.querySelector(`#krmn-${endID}`);
          eldestination.classList.add('highlight');
          setTimeout(() => {
            eldestination.classList.remove('highlight');
            this.isLocked = false;
          }, 1495);
          return eldestination.scrollIntoView();
        } else if(elvoice?.querySelector('.control').contains(e.target) || elvoice?.querySelector('.range').contains(e.target)) {
          return;
        } else if(eldoc?.contains(e.target)) {
          const link = document.createElement('a');
          link.href = eldoc.getAttribute('href');
          link.target = "_blank";
          link.download = eldoc.querySelector('p').innerText;
          link.click();
          setTimeout(() => link.remove(), 1000);
          return;
        }
        if(this.isLocked) return;
        this.isLocked = true;
        return this.chatOptions(card, ch);
      }
      if(!uc) {
        this.chatlist.appendChild(card);
      }
      const chTxt = card.querySelector('.chp.text p');
      if(chTxt && chTxt.offsetWidth >= 470) card.classList.add('long');
    });
    if(fdb.length > this.chatcount) this.setReadChat();
    this.chatcount = fdb.length;
    setTimeout(() => {if(!this.disabelAutoScroll) this.chatlist.scrollTop = this.chatlist.scrollHeight}, 100);
  }
  chatOptions(oldcard, ch) {
    const oldchatpop = this.el.querySelector('.chatpop');
    if(oldchatpop) oldchatpop.remove();
    const chatpop = document.createElement('div');
    chatpop.classList.add('chatpop');
    chatpop.innerHTML = '<div class="box"><div class="chatlist"></div><div class="actions"></div></div>';
    const card = oldcard.cloneNode(true);
    card.removeAttribute('id');
    const sendername = card.querySelector('.sender');
    if(sendername) sendername.style.display = 'block';
    chatpop.querySelector('.chatlist').append(card);
    const playAudio = card.querySelector('.control .btn');
    if(playAudio) playAudio.onclick = async() => {
      chatpop.classList.add('out');
      await modal.waittime();
      card.remove();
      chatpop.remove();
      this.isLocked = false;
      oldcard.querySelector('.control .btn').click();
    }

    const btnReply = document.createElement('div');
    btnReply.classList.add('btn', 'btn-reply');
    btnReply.innerHTML = `<i class="fa-solid fa-reply"></i> REPLY`;
    chatpop.querySelector('.actions').append(btnReply);
    btnReply.onclick = async() => {
      chatpop.classList.add('out');
      await modal.waittime();
      card.remove();
      chatpop.remove();
      this.isLocked = false;
      this.showReply(ch);
    }

    if(ch.u.id === db.ref.account.id) {
      if(!ch.v) {
        const btnEdit = document.createElement('div');
        btnEdit.classList.add('btn', 'btn-edit');
        btnEdit.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> EDIT`;
        btnEdit.onclick = async() => {
          chatpop.classList.add('out');
          await modal.waittime();
          card.remove();
          chatpop.remove();
          if(Date.now() > ch.ts + (1000 * 60 * 15)) {
            await modal.alert(lang.CONTENT_EDIT_EXPIRED || lang.ERROR);
            this.chatOptions(oldcard, ch);
            this.isLocked = false;
            return;
          };
          this.isLocked = false;
          this.showEdit(ch);
        }
        chatpop.querySelector('.actions').append(btnEdit);
      }

      const btnDelete = document.createElement('div');
      btnDelete.classList.add('btn', 'btn-delete');
      btnDelete.innerHTML = `<i class="fa-solid fa-trash-can"></i> DELETE`;
      btnDelete.onclick = async() => {
        chatpop.classList.add('out');
        await modal.waittime();
        card.remove();
        chatpop.remove();
        const confDelete = await modal.confirm({
          msg: lang.CONTENT_WANT_TO_DELETE,
          okx: lang.CONTENT_CONFIRM_DELETE
        });
        if(!confDelete) {
          this.chatOptions(oldcard, ch);
          this.isLocked = false;
          return;
        }
        this.closeEdit();
        this.isLocked = false;
        const tempdata = {};
        tempdata.id = ch.id;
        tempdata.ts = ch.ts;
        tempdata.d = Date.now();
        tempdata.u = {id:db.ref.account.id};

        oldcard.classList.add('deleted');
        oldcard.querySelector('.chp.text p').innerHTML = `<i class="fa-solid fa-ban"></i> <i>${ch.u.id === db.ref.account.id ? lang.CONTENT_YOU_DELETED : lang.CONTENT_DELETED}</i>`;

        const data = {conty:this.conty, id:this.user.id, text_id:ch.id};
        const delMsg = await xhr.post('/chat/uwu/deleteMessage', data);
        oldcard.classList.remove('deleted');
        
        if(delMsg?.code !== 200) {
          await modal.alert(lang[delMsg.msg] || lang.ERROR);
          oldcard.querySelector('.chp.text p').innerHTML = '';
          if(ch.txt) oldcard.querySelector('.chp.text p').append(ch.txt.trim());
          const cancelDel = elgen.contentCard(ch, this.user, this.conty);
          if(!cancelDel.uc) this.chatlist.append(cancelDel.card);
          return;
        }

        const dcard = elgen.contentCard(tempdata, this.user, this.conty, 1);
        if(!dcard.uc) this.chatlist.append(dcard.card);

        const ckey = this.conty === 1 ? 'chats' : 'groups';
        const cdb = db.ref[ckey][this.user?.chat_id];

        db.ref[ckey][cdb.id].chats[delMsg.data.chat.id] = delMsg.data.chat;

        cloud.send({ "id": "update-msg", "to": delMsg.data.peers, "data": { "text": delMsg.data.chat.txt } });
        userState.pmbottom?.forceUpdate?.();
        userState.pmmid?.forceUpdate?.();
      }

      chatpop.querySelector('.actions').append(btnDelete);
    }

    const btnCancel = document.createElement('div');
    btnCancel.classList.add('btn', 'btn-cancel');
    btnCancel.innerHTML = `<i class="fa-solid fa-circle-x"></i> CANCEL`;
    chatpop.querySelector('.actions').append(btnCancel);
    btnCancel.onclick = async() => {
      chatpop.classList.add('out');
      await modal.waittime();
      card.remove();
      chatpop.remove();
      this.isLocked = false;
    }

    this.el.append(chatpop);
  }
  showReply(ch) {
    this.closeEdit();
    this.contents.rep = null;

    this.ereply = document.createElement('div');
    this.ereply.classList.add('embed');
    this.ereply.innerHTML = `
    <div class="box">
      <div class="left">
        <p>${ch.u.id === db.ref.account.id ? db.ref.account.username : ch.u.username}</p>
        <p class="msg"></p>
      </div>
      <div class="right">
        <div class="btn btn-cancel-rep"><i class="fa-duotone fa-circle-x"></i></div>
      </div>
    </div>`;
    const chtxt = this.ereply.querySelector('.left .msg');
    if(ch.v) {
      chtxt.innerHTML = '<i class="fa-light fa-microphone"></i> Voice Chat';
    } else if(ch.i) {
      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = ch.i.match(imgExt)?.[1];

      if(validatext.image.includes(fileExt.toLowerCase())) {
        chtxt.innerHTML = '<i class="fa-light fa-image"></i> ';
      } else if(validatext.video.includes(fileExt.toLowerCase())) {
        chtxt.innerHTML = '<i class="fa-light fa-film"></i> ';
      } else {
        chtxt.innerHTML = '<i class="fa-light fa-file"></i> ';
      }
      if(!ch.txt) chtxt.append('Media');
    }
    if(ch.txt) {
      chtxt.append(elgen.ss(ch.txt, 50).replace(/\s/g, ' '));
    }

    this.inpMsg.focus();

    const cancelReply = this.ereply.querySelector('.right .btn-cancel-rep');
    cancelReply.onclick = () => this.closeReply();
    this.contents.rep = ch.id;
    this.bottomclass.prepend(this.ereply);
    this.growInput();
  }
  closeReply() {
    this.contents.rep = null;
    this.ereply?.remove();
    this.growInput();
  }
  showEdit(ch) {
    const oldEdit = this.el.querySelector('.bottom .embed');
    if(oldEdit) oldEdit.remove();
    this.attach?.remove();
    this.chatedit = { id:ch.id, ts:ch.ts };
    if(this.contents.voice.blob) URL.revokeObjectURL(this.contents.voice.blob);
    if(this.contents.file.blob) URL.revokeObjectURL(this.contents.file.blob);
    this.contents = {
      text:null,
      rep:null,
      voice:{ src:null, blob:null },
      file:{ name:null, src:null, blob:null }
    }

    this.inpMsg.value = ch.txt || '';
    this.inpMsg.focus();

    this.eedit = document.createElement('div');
    this.eedit.classList.add('embed', 'cb');
    this.eedit.innerHTML = `
    <div class="box">
      <div class="left">
        <p><i class="fa-light fa-pencil"></i> Editing</p>
        <p class="msg"></p>
      </div>
      <div class="right">
        <div class="btn btn-cancel-rep"><i class="fa-duotone fa-circle-x"></i></div>
      </div>
    </div>`;
    const chtxt = this.eedit.querySelector('.left .msg');
    chtxt.append(elgen.ss(ch.txt || '-', 50).replace(/\s/g, ' '));

    const cancelEdit = this.eedit.querySelector('.right .btn-cancel-rep');
    cancelEdit.onclick = () => this.closeEdit();

    this.bottomclass.prepend(this.eedit);
    this.growInput();
  }
  closeEdit() {
    this.inpMsg.value = '';
    this.chatedit = {};
    this.eedit?.remove();
    this.growInput();
  }
  btnListener() {
    const eluser = document.querySelector('.top .left .user');
    eluser.onclick = async() => {
      if(this.user.chat_id === 'zzz' && !db.ref.account.b?.includes(1)) return;
      if(this.user.code || !this.user.chat_id) return modal.alert(lang.PROF_DELETED_USER);
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      this.user.prof.run();
      userState.locked.bottom = false;
    }
    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        nrw.runQueue();
        nrw.setEmpty();
      }
    }
  }
  keyDown(e) {
    const key = e.key.toLowerCase();
    if(key === 'shift') this.downed.add(key);
    if(key === 'enter' && this.downed.has('shift')) {
      e.preventDefault();
      if(this.planesend) return this.sendMessage();
    }
  }
  keyUp(e) {
    const key = e.key.toLowerCase();
    if(key === 'shift') {
      if(this.downed.has(key)) this.downed.delete(key);
    }
  }
  formListener() {
    const btnCall = this.el.querySelector('.btn-call');
    btnCall.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      if(!this.user.isfriend) {
        await modal.alert(lang.PROF_ALR_NOFRIEND_1);
        this.isLocked = false;
        return;
      }
      if(!checkCall) {
        await modal.alert('theres no call');
        this.isLocked = false;
        return;
      }
      const checkPerm = await checkMedia({audio:true});
      if(!checkPerm) {
        await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES);
        this.isLocked = false;
        return;
      }
      this.isLocked = false;
      SendCall({user:this.user});
    }
    const btnVideo = this.el.querySelector('.btn-video');
    btnVideo.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      if(!this.user.isfriend) {
        await modal.alert(lang.PROF_ALR_NOFRIEND_2);
        this.isLocked = false;
        return;
      }
      const confirmVoiceCall = await modal.confirm({
        msg: `${lang.CALL_VIDEO_DEVELOPMENT_1}<br/>${lang.CALL_VIDEO_DEVELOPMENT_2}`,
        okx: 'VOICE CALL'
      });
      if(confirmVoiceCall) {
        this.isLocked = false;
        return btnCall.click();
      }
      this.isLocked = false;
    }
    if(this.conty > 1) {
      btnCall.remove();
      btnVideo.remove();
    }
    const btnMore = this.el.querySelector('.btn-more');
    btnMore.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      
      await modal.alert('This -More Options- feature is currently under development');
      this.isLocked = false;
    }

    this.chatlist.onscroll = () => {
      if(Math.floor(this.chatlist.scrollHeight - this.chatlist.scrollTop) < Math.floor(this.chatlist.clientHeight + 50)) {
        this.disabelAutoScroll = false;
        let elGoToLast = this.midclass.querySelector('.gotolast');
        if(elGoToLast) elGoToLast.remove();
      } else {
        this.disabelAutoScroll = true;
        let elGoToLast = this.midclass.querySelector('.gotolast');
        if(!elGoToLast) {
          elGoToLast = document.createElement('div');
          elGoToLast.classList.add('gotolast');
          elGoToLast.innerHTML = `<i class="fa-solid fa-chevrons-down"></i>`;
          this.midclass.append(elGoToLast);
        }
        elGoToLast.onclick = () => this.chatlist.scrollTop = this.chatlist.scrollHeight;
      }
    }

    this.inpMsg = this.el.querySelector('#content-input');
    this.inpMsg.oninput = () => this.growInput();
    this.inpMsg.onkeydown = e => this.keyDown(e);
    this.inpMsg.onkeyup = e => this.keyUp(e);

    this.btnImg = this.el.querySelector('.btn-image');
    this.btnImg.onclick = () => this.findFile('image/*,video/*');

    this.btnFile = this.el.querySelector('.btn-attach');
    this.btnFile.onclick = () => this.findFile();

    this.btnSend = this.el.querySelector('.btn-voice');
    this.btnSend.onclick = async() => {
      if(this.planesend) {
        this.inpMsg.focus();
        return this.sendMessage();
      }
      return this.getVoiceRecord();
    }

    setTimeout(() => {
      this.inpMsg.readOnly = true;
      this.inpMsg.focus();
      this.inpMsg.readOnly = false;
    }, 500);
  }
  growInput() {
    if(!this.planesend && (this.inpMsg.value.trim().length > 0 || this.contents.file?.src)) {
      this.planesend = true;
      this.btnSend.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    } else if(this.planesend && (this.inpMsg.value.trim().length < 1 && !this.contents.file.src)) {
      this.planesend = false;
      this.btnSend.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
    }

    this.inpMsg.style.height = '24px';
    const inpMsgSHeight = this.inpMsg.scrollHeight > 80 ? 80 : this.inpMsg.scrollHeight;
    const inpDocumentSHeight = this.bottomclass.querySelector('.attach')?.offsetHeight || 0;
    const repSHeight = this.bottomclass.querySelector('.embed')?.offsetHeight || 0;
    const mediaHeights = inpDocumentSHeight + repSHeight;

    this.inpMsg.style.height = inpMsgSHeight + 'px';
    const forBottom = inpMsgSHeight < 30 ? (inpMsgSHeight + mediaHeights + 31) : (inpMsgSHeight + mediaHeights + (12 * 2));
    this.bottomclass.style.height = forBottom + 'px';
    this.midclass.style.height = `calc(100% - (60px + ${forBottom}px))`;
  }
  findFile(fileAccept = null) {
    const inp = document.createElement('input');
    inp.type = 'file';
    if(fileAccept) inp.accept = fileAccept;
    inp.onchange = async() => {
      this.closeEdit();

      const file = inp.files[0];

      const filesrc = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          return resolve(reader.result);
        }
        reader.readAsDataURL(file);
      });
      this.contents.file.name = file.name;
      this.contents.file.src = filesrc;
      this.contents.file.blob = URL.createObjectURL(file);

      const attachbefore = this.bottomclass.querySelector('.attach');
      if(attachbefore) attachbefore.remove();

      this.attach = document.createElement('div');
      this.attach.classList.add('attach');
      this.attach.innerHTML = `<div class="media"></div><div class="close"><div class="btn"><i class="fa-duotone fa-circle-x"></i></div></div>`;

      const imgExt = /\.([a-zA-Z0-9]+)$/;
      const fileExt = file.name.match(imgExt)[1];

      if(validatext.image.includes(fileExt.toLowerCase())) {
        this.showImage(this.attach, file.name, filesrc);
      } else if(validatext.video.includes(fileExt.toLowerCase())) {
        this.showVideo(this.attach, file.name, filesrc);
      } else {
        this.showDocument(this.attach, file.name, filesrc);
      }
      this.bottomclass.prepend(this.attach);
      const repembed = this.bottomclass.querySelector('.embed');
      if(repembed) this.bottomclass.prepend(repembed);
      this.growInput();
      const closeFile = this.attach.querySelector('.close');
      closeFile.onclick = () => this.closeAttach();
    }
    inp.click();
  }
  closeAttach() {
    this.contents.file.name = null;
    this.contents.file.src = null;
    this.attach?.remove();
    this.growInput();
  }
  showImage(eattach, filename) {
    eattach.querySelector('.media').innerHTML = `<div class="img"></div><div class="name"><p>fivem_wp.jpg</p></div>`;
    const eimg = eattach.querySelector('.media .img');
    const ename = eattach.querySelector('.media .name');
    ename.innerText = filename;
    const img = new Image();
    img.src = this.contents.file.blob;
    img.onload = () => this.growInput();
    img.onerror = () => {
      img.remove();
      this.showDocument(eattach, filename);
      // ...Video
      // new Video
    }
    eimg.append(img);
  }
  showVideo(eattach, filename) {
    eattach.querySelector('.media').innerHTML = `<div class="img"></div><div class="name"><p>fivem_wp.jpg</p></div>`;
    const evid = eattach.querySelector('.media .img');
    const ename = eattach.querySelector('.media .name');
    ename.innerText = filename;
    const vid = document.createElement('video');
    vid.src = this.contents.file.blob;
    vid.volume = 0;
    vid.controls = false;
    vid.onload = () => this.growInput();
    vid.onerror = () => {
      vid.remove();
      this.showDocument(eattach, filename);
    }
    evid.append(vid);
  }
  showDocument(eattach, filename) {
    eattach.querySelector('.media').innerHTML = `<div class="document"><p></p></div>`;
    const docExtFormat = /\.([a-zA-Z0-9]+)$/;
    const docExtName = filename.match(docExtFormat)?.[1];
    eattach.querySelector('.media p').innerText = elgen.ss(filename, 30) + docExtName;
  }
  async sendMessage() {
    if(this.isLocked) return;

    const tempdata = {};
    tempdata.id = this.chatedit?.id || "temp" + Date.now();
    tempdata.ts = this.chatedit?.ts || Date.now();
    tempdata.txt = this.inpMsg.value.trim();
    tempdata.u = {id:db.ref.account.id};
    if(this.contents.file.src) {
      const tempExt = /\.([a-zA-Z0-9]+)$/;
      const tempfileExt = this.contents.file.name.match(tempExt)?.[1];
      tempdata.i = `${this.contents.file.blob}.${tempfileExt}`;
    }
    if(this.contents.voice) tempdata.v = this.contents.voice.blob;
    if(this.contents.rep) tempdata.r = this.contents.rep;
    if(this.chatedit?.id) tempdata.e = this.chatedit.id;

    const {card, uc} = elgen.contentCard(tempdata, this.user, this.conty, 1);
    card.classList.add('sending');

    const sameDay = sdate.sameday(Date.now(), tempdata.ts);
    if(sameDay) {
      card.querySelector('.chp.time p').innerHTML = sdate.time(tempdata.ts) + ' <i class="fa-regular fa-clock"></i>';
    } else {
      card.querySelector('.chp.time p').innerHTML = `${sdate.date(tempdata.ts)} ${sdate.time(tempdata.ts)} <i class="fa-regular fa-clock"></i>`;
    }

    card.querySelector('.chp.text p').innerText = this.inpMsg.value.trim();
    if(!uc) {
      this.chatlist.append(card);
      this.chatlist.scrollTop = this.chatlist.scrollHeight;
    }
    const chTxtTemp = card.querySelector('.chp.text p');
    if(chTxtTemp && chTxtTemp.offsetWidth >= 470) card.classList.add('long');

    this.contents.text = this.inpMsg.value.trim().length < 1 ? null : this.inpMsg.value.trim();

    const data = {conty:this.conty, id:this.user.id};
    if(this.contents.text) data.txt = this.contents.text;
    if(this.contents.voice.src) {
      data.voice = this.contents.voice.src;
    } else if(this.contents.file?.name && this.contents.file?.src) {
      data.file = {name:this.contents.file.name,src:this.contents.file.src}
    }
    if(this.contents.rep) data.rep = this.contents.rep;
    if(this.chatedit?.id) data.edit = this.chatedit.id;

    this.inpMsg.value = '';
    this.contents.file.name = null;
    this.contents.file.src = null;
    this.contents.file.blob = null;
    this.contents.rep = null;
    this.contents.voice.blob = null;
    this.contents.voice.src = null;
    this.chatedit = {};

    this.closeAttach();
    this.closeReply();
    this.closeEdit();
    this.growInput();

    const sendMsg = await xhr.post('/chat/uwu/sendMessage', data);
    card.classList.remove('sending');
    if(sendMsg?.code === 413) {
      await modal.alert(lang.ACC_FILE_LIMIT.replace(/{SIZE}/g, '2.5MB'));
      if(!tempdata.e) {
        await modal.waittime(1000);
        card.remove();
      }
      return;
    }
    if(sendMsg?.code === 404) {
      const cancelChTxtTemp = card.querySelector('.chp.text p');
      cancelChTxtTemp.innerHTML = `<i class="fa-solid fa-ban"></i> <i>${lang.CONTENT_YOU_DELETED}</i>`;
      card.classList.remove('long');

      modal.alert(lang[sendMsg.msg] || lang.ERROR);
      return;
    }
    if(sendMsg.data?.expired) {
      const tempcdb = db.ref[this.conty === 1 ? 'chats' : 'groups'][this.user?.chat_id].chats[tempdata.id];
      const cancelTemp = { ...tempcdb };
      card.querySelector('.chp.text p').innerHTML = '';
      const cancelChTxtTemp = card.querySelector('.chp.text p');
      cancelChTxtTemp.append(cancelTemp.txt.trim());
      if(cancelChTxtTemp && cancelChTxtTemp.offsetWidth >= 470) card.classList.add('long');

      await modal.alert(lang[sendMsg.msg] || lang.ERROR);
      userState.pmbottom?.forceUpdate();
      return;
    }
    if(sendMsg?.code !== 200) {
      await modal.alert(lang[sendMsg.msg]?.replace(/{TEXT_LENGTH}/, '500') || lang.ERROR);
      if(!tempdata.e) {
        await modal.waittime(1000);
        card.remove();
      }
      return;
    }
    const ckey = this.conty === 1 ? 'chats' : 'groups';
    const cdb = db.ref[ckey][this.user?.chat_id];
    if(!tempdata.e) card.remove();
    const clsid = tempdata.e ? 'update-msg' : 'send-msg';
    cloud.send({ "id": clsid, "to": sendMsg.data.peers, "data": {
      "name": db.ref.account.username,
      "text": sendMsg.data.chat.txt,
      "chat_id": sendMsg.data.chat.ckey
    }});

    if(!this.user.chats) {
      // this.user.chat_id = sendMsg.data.chat.ckey;
      this.user.chats = {};
      this.user.chats[sendMsg.data.chat.id] = sendMsg.data.chat;

      const currentUser = {};

      Object.keys(this.user).filter(k => !['prof','chats'].includes(k)).forEach(k => {
        currentUser[k] = this.user[k];
      });
      db.ref[ckey][sendMsg.data.chat.ckey] = {};
      db.ref[ckey][sendMsg.data.chat.ckey].users = [{...currentUser}];
      db.ref[ckey][sendMsg.data.chat.ckey].chats = this.user.chats;
      db.ref[ckey][sendMsg.data.chat.ckey].id = sendMsg.data.chat.ckey;

      userState.pmbottom?.forceUpdate?.();
      userState.pmmid?.forceUpdate?.();
      return;
    }

    db.ref[ckey][cdb.id].chats[sendMsg.data.chat.id] = sendMsg.data.chat;

    const sentcard = elgen.contentCard(sendMsg.data.chat, this.user, this.conty);
    if(!sentcard.uc) {
      this.chatlist.appendChild(sentcard.card);
      this.chatlist.scrollTop = this.chatlist.scrollHeight;
    }
    const chTxt = sentcard.card.querySelector('.chp.text p');
    if(chTxt && chTxt.offsetWidth >= 470) sentcard.card.classList.add('long');

    userState.pmbottom?.forceUpdate?.();
    userState.pmmid?.forceUpdate?.();
  }
  async getVoiceRecord() {
    if(this.isLocked) return;
    this.isLocked = true;

    const checkPerm = await checkMedia({audio:true});
    if(!checkPerm) {
      this.isLocked = false;
      return modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #2');
    }

    this.closeAttach();
    this.closeEdit();

    const vrebefore = this.el.querySelector('.vrecorder');
    if(vrebefore) vrebefore.remove();

    this.vrec = document.createElement('div');
    this.vrec.classList.add('vrecorder');
    this.vrec.innerHTML = `
    <div class="box">
      <div class="rec-timestamp">--:--:--</div>
      <div class="actions record">
        <div class="recording"></div>
      </div>
      <div class="actions">
        <div class="btn btn-cancel cr"><i class="fa-solid fa-x"></i></div>
        <div class="btn btn-restart cy"><i class="fa-solid fa-rotate-left"></i></div>
      </div>
    </div>`;
    const ts = this.vrec.querySelector('.rec-timestamp');
    const btncancel = this.vrec.querySelector('.btn-cancel');
    const btnrestart = this.vrec.querySelector('.btn-restart');
    const btnrec = this.vrec.querySelector('.recording');

    elvoice(btnrec, !isrecording);

    if(!recorder) {
      const nRecorder = await SetupAudioRecorder(this);
      if(!nRecorder || !nRecorder.newRecorder && !nRecorder.stream) {
        recorder = null;
        mediaStream = null;
      } else {
        recorder = nRecorder.newRecorder;
        mediaStream = nRecorder.stream;
      }
      if(!recorder) {
        isrecording = false;
        await this.vrecDestroy();
        await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #3');
        this.isLocked = false;
        return;
      }
    }

    btnrec.onclick = async() => {
      if(!recorder) {
        isrecording = false;
        await this.vrecDestroy();
        await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #4');
        this.isLocked = false;
        return;
      }
      if(isrecording) {
        try {
          stoprecord = true;
          recorder.stop();
          isrecording = elvoice(btnrec, isrecording);
          this.voiceTimeStamp(ts, false);
        } catch {
          stoprecord = false;
          isrecording = elvoice(btnrec, isrecording);
          isrecording = false;
          this.voiceTimeStamp(ts, false);
          await this.vrecDestroy();
          await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #5');
          this.isLocked = false;
          return;
        }
      } else {
        try {
          recorder.start();
        } catch {
          recorder = null;
          recorderChunks = [];
          if(mediaStream) {
            for(const track of mediaStream.getTracks()) {
              track.enabled = false;
              setTimeout(() => {
                track.stop();
                mediaStream.removeTrack(track);
              }, 1000);
            }
          }
          isrecording = false;
          this.voiceTimeStamp(ts, false);
          await this.vrecDestroy();
          await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #6');
          this.isLocked = false;
          return;
        }
        isrecording = elvoice(btnrec, isrecording);
        this.voiceTimeStamp(ts, true);
      }
    }
    btnrestart.onclick = async() => {
      if(isrecording) {
        try {
          stoprecord = false;
          recorder.stop();
          isrecording = elvoice(btnrec, isrecording);
          this.voiceTimeStamp(ts, false);
        } catch {
          stoprecord = false;
          isrecording = elvoice(btnrec, isrecording);
          isrecording = false;
          this.voiceTimeStamp(ts, false);
          await this.vrecDestroy();
          await modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #7');
          this.isLocked = false;
        }
      }
    }
    btncancel.onclick = async() => {
      if(isrecording) {
        try {
          recorder.stop();
        } catch {
          stoprecord = false;
        }
      }
      stoprecord = false;
      isrecording = false;
      this.voiceTimeStamp(ts, false);
      await this.vrecDestroy();
      this.isLocked = false;
    }

    this.el.append(this.vrec);
  }
  voiceTimeStamp(ts, setrun) {
    if(!ts) return;
    if(setrun) {
      ts.innerHTML = '00:00:00';
      let dd = 0, mm = 0, jj = 0;
      recordinterval = setInterval(() => {
        const stillRecord = document.querySelector('.rec-timestamp');
        if(!stillRecord) {
          clearInterval(recordinterval);
          recordinterval = null;
          recorder = null;
          recorderChunks = [];
          if(mediaStream) {
            for(const track of mediaStream.getTracks()) {
              track.enabled = false;
              setTimeout(() => {
                track.stop();
                mediaStream.removeTrack(track);
              }, 1000);
            }
          }
          isrecording = false;
          stoprecord = false;
          return;
        }
        dd++;
        if(dd >= 60) { dd = 0; mm++ }
        if(mm >= 60) { mm = 0; jj++ }

        ts.innerHTML = `${jj<10?'0'+jj:jj}:${mm<10?'0'+mm:mm}:${dd<10?'0'+dd:dd}`;
      }, 995);
    } else {
      clearInterval(recordinterval);
      recordinterval = null;
      ts.innerHTML = '--:--:--';
    }
  }
  async sendVoice(audiosrc, tempsrc) {
    this.contents.voice.src = audiosrc;
    this.contents.voice.blob = tempsrc;
    this.contents.file.name = null;
    this.contents.file.src = null;
    this.contents.file.blob = null;
    if(this.vrec) await this.vrecDestroy();
    this.vrec = null;
    this.isLocked = false;
    this.sendMessage();
  }
  vrecDestroy() {
    return new Promise(async resolve => {
      if(this.vrec) {
        this.vrec.classList.add('out');
        await modal.waittime();
        this.vrec.remove();
        resolve();
      } else {
        resolve();
      }
    });
  }
  forceUpdate() {
    this.updateUser();
    this.renderChats();
  }
  fRemove() {
    this.chatcount = 0;
    this.contents = {text:null,rep:null,voice:{src:null,blob:null},file:{name:null,src:null,blob:null}};
    this.chatedit = {};
    this.planesend = false;
    this.downed.clear();
    this.disabelAutoScroll = false;
    recorder = null;
    recorderChunks = [];
    if(mediaStream) {
      for(const track of mediaStream.getTracks()) {
        track.enabled = false;
        setTimeout(() => {
          track.stop();
          mediaStream.removeTrack(track);
        }, 1000);
      }
    }
    isrecording = false;
    stoprecord = false;
    recordinterval = null;
    this.inpMsg.removeEventListener('input', this.growInput);
    this.isLocked = false;
    userState.pmbottom = null;
    userState.pmlast = null;
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.chatcount = 0;
      this.contents = {text:null,rep:null,voice:{src:null,blob:null},file:{name:null,src:null,blob:null}};
      this.chatedit = {};
      this.planesend = false;
      this.downed.clear();
      this.disabelAutoScroll = false;
      recorder = null;
      recorderChunks = [];
      if(mediaStream) {
        for(const track of mediaStream.getTracks()) {
          track.enabled = false;
          setTimeout(() => {
            track.stop();
            mediaStream.removeTrack(track);
          }, 1000);
        }
      }
      isrecording = false;
      stoprecord = false;
      recordinterval = null;
      this.inpMsg.removeEventListener('input', this.growInput);
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
    this.updateUser();
    this.renderChats();
    this.btnListener();
    this.formListener();
  }
}

function chatSelection(obj, conty) {
  if(conty === 1) return {
    id: obj.id,
    username: obj.username || lang.DELETED_USER,
    chats: Object.values(db.ref.chats).find(ch => ch.users.find(k => k.id === obj.id))
  }
  if(conty === 2) return {
    id: obj.id,
    username: obj.n,
    chats: Object.values(db.ref.groups).find(ch => ch.id === obj.id)
  }
}
function SetupAudioRecorder(content) {
  return new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
      const newRecorder = new MediaRecorder(stream, { audioBitsPerSecond: 128000 });
      newRecorder.onerror = err => {
        // console.log(err);
        this.isLocked = false;
        return modal.alert(lang.CONTENT_NO_MEDIA_DEVICES + ' #1');
      }
      newRecorder.ondataavailable = e => {
        recorderChunks.push(e.data);
      }
      newRecorder.onstop = () => {
        const blob = new Blob(recorderChunks, {type:"audio/ogg; codecs=0"});
        recorderChunks = [];
        content.voiceTimeStamp(document.querySelector('.rec-timestamp'), false);
        const el = document.querySelector('.recording');
        if(el) el.innerHTML = `<div class="btn btn-start"><i class="fa-solid fa-microphone-lines"></i></div>`;
        isrecording = false;
        if(stoprecord) {
          const reader = new FileReader();
          reader.onload = () => content.sendVoice(reader.result, URL.createObjectURL(blob));
          reader.readAsDataURL(blob);
        }
        stoprecord = false;
      }
      resolve({newRecorder, stream});
    }).catch(err => {
      console.log(err);
      isrecording = false;
      stoprecord = false;
      resolve(null);
    });
  });
}

function elvoice(el, ty = false) {
  if(ty) {
    el.innerHTML = `<div class="btn btn-start"><i class="fa-solid fa-microphone-lines"></i></div>`;
    return false;
  } else {
    el.innerHTML = `<div class="btn-spinning"></div><div class="btn-stop"><i class="fa-solid fa-paper-plane-top"></i></div>`;
    return true;
  }
}