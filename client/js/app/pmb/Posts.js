import modal from "../../helper/modal.js";
import xhr from "../../helper/xhr.js";
import sceneIn from "../../helper/sceneIn.js";
import userState from "../../manager/userState.js";
import elgen from "../../manager/elgen.js";
import Profile from "./Profile.js";
import Account from "./Account.js";
import db from "../../manager/db.js";
import cloud from "../../manager/cloud.js";
import * as nrw from "../../manager/nrw.js";
import CreatePost from "./CreatePost.js";
let lang = {};

const filterlist = [
  { id: "filt_1", label: "POST_FILT_1" },
  { id: "filt_2", label: "POST_FILT_2" },
]

export default class {
  constructor({ pfilter = 0 } = {}) {
    this.id = 'posts';
    this.isLocked = false;
    this.cmtSect = null;
    this.cmtLocked = false;
    this.pfilter = pfilter;
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('posts', 'pmb');
    this.el.innerHTML = `
    <div class="posttitle">
      <div class="btn btn-back"><i class="fa-solid fa-arrow-left"></i></div>
      <div class="title">${lang.APP_POSTS.toUpperCase()}</div>
      <div class="btn btn-filter"><i class="fa-solid fa-filter-list"></i></div>
    </div>
    <div class="postlist">
    </div>
    <div class="postactions">
      <div class="btn btn-create"><i class="fa-solid fa-plus"></i> ${lang.POSTS_CREATE}</div>
    </div>`;
    this.elist = this.el.querySelector('.postlist');
  }
  btnListener() {
    const btnBack = this.el.querySelector('.btn-back');
    if(btnBack) btnBack.onclick = async() => {
      if(nrw.isNarrow) {
        await this.destroy();
        nrw.runQueue();
        nrw.setEmpty();
      }
    }
    const btnFilter = this.el.querySelector('.btn-filter');
    btnFilter.onclick = async() => {
      await this.closeComments();
      const filterLocale = filterlist.map(fl => {
        return {
          id: fl.id,
          label: lang[fl.label]
        }
      });
      const filtIndex = filterlist.findIndex(lfilt => lfilt.id === (this.pfilter ? 'filt_2' : 'filt_1'));
      if(filtIndex >= 0) filterLocale[filtIndex].actived = true;

      const changeFilter = await modal.select({
        ic: "filter-list",
        msg: lang.POST_FILTER,
        opt: {
          name: "filter",
          items: filterLocale
        }
      });
      if(!changeFilter) {
        this.isLocked = false;
        return;
      }
      const newpfilter = changeFilter.filter === 'filt_1' ? 0 : 1;
      if(this.pfilter === newpfilter) {
        this.isLocked = false;
        return;
      }
      this.pfilter = newpfilter;
      this.elist.innerHTML = '';
      this.writeData();
      this.isLocked = false;
    };
    const btnCreatePost = this.el.querySelector('.btn-create');
    btnCreatePost.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      if(userState.pmmid?.id === 'post_create') return;
      if(userState.locked.bottom) return;
      userState.locked.bottom = true;
      await userState.pmbottom?.destroy?.();
      new CreatePost({classBefore:this}).run();
      userState.locked.bottom = false;
      this.isLocked = false;
    }
  }
  async writeData() {
    let loadCard = document.querySelector('.loadcardwait');
    if(!loadCard) {
      loadCard = document.createElement('div');
      loadCard.classList.add('card', 'loadcardwait');
      loadCard.innerHTML = '<div class="spinner center"><i class="fa-duotone fa-spinner-third fa-spin"></i></div>';
      this.elist.prepend(loadCard);
    }

    const postdata = await xhr.get('/post/uwu/all');
    if(postdata?.code !== 200) {
      await modal.waittime(2000);
      return this.writeData();
    }
    if(this.pfilter) {
      postdata.data = postdata.data.filter(cp => cp.u.id === db.ref.account.id);
    }
    if(postdata.data.length < 1) {
      loadCard.innerHTML = `<div class="center">${lang.CHTS_NOCHAT}</div>`;
      return;
    }
    loadCard.remove();
    postdata.data.forEach(cp => {
      if(!cp.l) cp.l = [];
      if(!cp.c) cp.c = [];
      const card = elgen.postCard(cp);
      this.elist.prepend(card);

      const btnUser = card.querySelector('.user');
      btnUser.onclick = () => this.openProfile(cp);

      const btnLike = card.querySelector('.btn-like');
      btnLike.onclick = async() => {
        if(this.isLocked) return;
        this.isLocked = true;
        this.likeCard(btnLike, card, cp);
        this.isLocked = false;
      }
      const btnComment = card.querySelector('.btn-comment');
      btnComment.onclick = async() => {
        if(this.isLocked) return;
        this.isLocked = true;
        this.showComments(cp);
      }

      const btnDelete = card.querySelector('.post-delete');
      if(btnDelete) btnDelete.onclick = async() => {
        if(this.isLocked) return;
        this.isLocked = true;

        const confirmDelete = await modal.confirm({
          ic: 'trash-can',
          msg: lang.POST_DELETE_MSG,
          okx: lang.CONTENT_CONFIRM_DELETE
        });

        if(!confirmDelete) {
          this.isLocked = false;
          return;
        }

        const remPost = await modal.loading(xhr.post('/post/uwu/delete', {id:cp.id}));
        if(remPost?.code !== 200) {
          await modal.alert(lang[remPost.msg] || lang.ERROR);
          this.isLocked = false;
          return;
        }

        postdata.data = postdata.data.filter(cpm => cpm.id !== cp.id);
        card.remove();

        this.isLocked = false;
      }
    });
  }
  likeCard(btnLike, card, cp) {
    cloud.asend('postLike', {id:cp.id});
    if(cp.l.includes(db.ref.account.id)) {
      cp.l = cp.l.filter(likeid => likeid !== db.ref.account.id);
      card.classList.remove('liked');
      btnLike.innerHTML = cp.l.length;
    } else {
      cp.l.push(db.ref.account.id);
      card.classList.add('liked');
      btnLike.innerHTML = cp.l.length;
    }
  }
  showComments(cp) {
    if(this.cmtSect) return;

    this.cmtSect = document.createElement('div');
    this.cmtSect.classList.add('postcomments');
    this.cmtSect.innerHTML = `
    <div class="top">
      <div class="title">Comments</div>
      <div class="btn btn-close"><i class="fa-duotone fa-circle-minus"></i></div>
    </div>
    <div class="mid">
    </div>
    <div class="bottom">
      <form class="form" id="post-comment-form" action="/post/comment/add" method="post">
        <input type="text" name="post-comment-text" id="post-comment-text" autocomplete="off" class="input" maxlength="300" placeholder="Type Here" />
        <button class="btn btn-post-send" id="post-comment-send"><i class="fa-solid fa-arrow-up"></i></button>
      </form>
    </div>`;
    this.el.append(this.cmtSect);

    const cmtForm = this.cmtSect.querySelector('#post-comment-form');
    cmtForm.onsubmit = async e => {
      e.preventDefault();
      if(this.cmtLocked) return;
      this.cmtLocked = true;
      const inpCmt = cmtForm.querySelector('#post-comment-text');

      const commentData = {};
      commentData.id = cp.id;
      commentData.msg = (inpCmt.value || '').trim();
      inpCmt.value = '';
      if(commentData.msg.length < 1) {
        await modal.alert(lang.POST_COMMENT_LENGTH);
        this.cmtLocked = false;
        return;
      }

      const tempComment = {
        u: {id:db.ref.account.id},
        txt:commentData.msg,
        ts: Date.now()
      }

      const tempCard = this.writeComment(tempComment, {tmp:1,cb:1,cp});

      const postComment = await xhr.post('/post/uwu/addcomment', commentData);
      if(postComment?.code !== 200) {
        inpCmt.value = commentData.msg
        tempCard.remove();
        await modal.alert(lang[postComment.msg]?.replace(/{TEXT_LENGTH}/, '300') || lang.ERROR);
        this.cmtLocked = false;
        return;
      }
      tempCard.classList.remove('sending');
      tempCard.remove();
      const enocmt = this.cmtSect.querySelector('.nocomment');
      if(enocmt) enocmt.remove();
      cp.c.push(postComment.data);
      this.writeComment(postComment.data, {cp});
      this.cmtLocked = false;
    }

    const btnClose = this.cmtSect.querySelector('.btn-close');
    btnClose.onclick = () => this.closeComments();

    const emid = this.cmtSect.querySelector('.mid');
    if(!cp.c || cp.c.length < 1) {
      emid.innerHTML = `<div class="center nocomment">${lang.CHTS_NOCHAT}</div>`;
    } else {
      const comments = cp.c.sort((a, b) => {
        if(a.ts > b.ts) return 1;
        if(a.ts < b.ts) return -1;
        return 0;
      });
      comments.forEach(cmt => this.writeComment(cmt, {cp}));
    }
  }
  writeComment(cmt, {tmp=0, cb=0, cp} = {}) {
    const emid = this.cmtSect.querySelector('.mid');

    const card = elgen.postCommentCard(cmt);
    if(tmp) card.classList.add('sending');
    emid.prepend(card);
    card.querySelector('.data .data-user .username').onclick = () => this.openProfile(cmt);
    card.querySelector('.photo').onclick = () => this.openProfile(cmt);
    const btnDelCmt = card.querySelector('.btn-delcomment');
    if(btnDelCmt) btnDelCmt.onclick = async() => {
      if(this.cmtLocked) return;
      this.cmtLocked = true;

      const remConfirm = await modal.confirm({
        msg: lang.POST_DELETE_CMT,
        okx: lang.DELETE
      });

      if(!remConfirm) {
        this.cmtLocked = false;
        return;
      }

      const removeCmt = await modal.loading(xhr.post('/post/uwu/removecomment', {
        cmt_id: cmt.id,
        id: cp.id
      }));
      if(removeCmt?.code !== 200) {
        await modal.alert(lang[removeCmt.msg] || lang.ERROR);
        this.cmtLocked = false;
        return;
      }
      cp.c = cp.c.filter(cpcmt => cpcmt.id !== cmt.id);
      card.remove();
      this.cmtLocked = false;
    }
    if(cb) return card;
  }
  async closeComments() {
    if(this.cmtSect) {
      this.cmtSect.classList.add('out');
      await modal.waittime(245);
      this.cmtSect.remove();
      this.cmtSect = null;
      this.cmtLocked = false;
      this.isLocked = false;
    }
  }
  async openProfile(cp) {
    if(cp.u.code || !cp.u.id) {
      await modal.alert(lang.PROF_DELETED_USER);
      this.isLocked = false;
      return;
    }
    if(userState.locked.bottom) {
      this.isLocked = false;
      return;
    }
    userState.locked.bottom = true;
    this.cmtSect = null;
    await userState.pmbottom?.destroy?.();
    if(cp.u.id === db.ref.account.id) {
      new Account({classBefore:this}).run();
    } else {
      new Profile({user:cp.u, classBefore:this}).run();
    }
    userState.locked.bottom = false;
    this.isLocked = false;
  }
  fRemove() {
    this.isLocked = false;
    this.cmtSect = null;
    this.cmtLocked = false;
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
      this.cmtSect = null;
      this.cmtLocked = false;
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
    this.writeData();
    this.btnListener();
  }
}