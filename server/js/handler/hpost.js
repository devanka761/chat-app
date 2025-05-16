const fs = require('fs');
const helper = require('../helper');
const db = require('../db');
const { validate } = require('../middlewares');
const hprofile = require('./hprofile');


module.exports = {
  getPost(uid, s) {
    if(!validate(['id'], s)) return {code: 400};
    const k = s.id.toLowerCase();
    const pdb = db.ref.p;
    const data = {};
    data.id = k;
    data.u = hprofile.getUser(uid, {id: pdb[k].u});
    data.i = helper.decryptData(pdb[k].i);
    data.ts = Number(helper.decryptData(pdb[k].ts));
    if(pdb[k].txt) data.txt = helper.decryptData(pdb[k].txt);
    if(pdb[k].l) data.l = pdb[k].l;
    if(pdb[k].c) data.c = Object.keys(pdb[k].c).map(key => {
      return {
        id: key,
        u: hprofile.getUser(uid, {id: pdb[k].c[key].u}),
        txt: helper.decryptData(pdb[k].c[key].txt),
        ts: Number(helper.decryptData(pdb[k].c[key].ts)),
      }
    });
    return data;
  },
  getAll(uid) {
    const pdb = db.ref.p;
    const posts = Object.keys(pdb).map(k => {
      return this.getPost(uid, {id:k});
    });

    return helper.rep(200, posts);
  },
  createPost(uid, s) {
    if(!validate(['filename', 'filesrc'], s)) return helper.rep(400);
    if(s.msg && !validate(['msg'], s)) return helper.rep(400);
    if(s.filename.length > 100) return helper.rep(400, "FILENAME_LENGTH");
    if(s.msg) {
      const transtxt = /(\s)(?=\s)/g;
      s.msg = s.msg.replace(transtxt, '').trim();
      if(s.msg.length > 500) return helper.rep(400, "ERROR_TEXT_LENGTH");
      const wsonly = /^\s+$/;
      if(wsonly.test(s.msg)) return helper.rep();
    }
    const dataurl = decodeURIComponent(s.filesrc);
    const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
    if(buffer.length > 2500000) return helper.rep(413, "ACC_FILE_LIMIT", {size:buffer.length});

    if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
    if(!fs.existsSync(`./server/dbfile/post`)) fs.mkdirSync(`./server/dbfile/post`);
    const filename = `P${Date.now().toString(32)}_${s.filename.replace(/\s/g, '_')}`;
    fs.writeFileSync(`./server/dbfile/post/${filename}`, buffer);

    const postData = {};
    postData.u = uid;
    postData.i = helper.encryptData(filename);
    if(s.msg) postData.txt = helper.encryptData(s.msg);
    postData.ts = helper.encryptData(Date.now().toString());

    const newKey = 'c' + Date.now().toString(32);
    db.ref.p[newKey] = postData;
    db.save('p');

    return helper.rep(200, this.getPost(uid, {id:newKey}));
  },
  removePost(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    const pdb = db.ref.p[s.id];
    if(!pdb) return helper.rep(404);
    if(pdb.u !== uid) return helper.rep(403);

    pdb.i = helper.decryptData(pdb.i);
    if(fs.existsSync(`./server/dbfile/post/${pdb.i}`)) fs.unlinkSync(`./server/dbfile/post/${pdb.i}`);
    delete db.ref.p[s.id];
    db.save('p');

    return helper.rep(200);
  },
  postLike(uid, s) {
    if(!validate(['id'], s)) return null;
    s.id = s.id.toLowerCase();
    const pdb = db.ref.p[s.id];
    if(!pdb) return null;
    if(!pdb.l) db.ref.p[s.id].l = [];

    if(pdb.l.includes(uid)) {
      db.ref.p[s.id].l = pdb.l.filter(k => k !== uid);
    } else {
      db.ref.p[s.id].l.push(uid);
    }

    db.save('p');

    return helper.rep(200);
  },
  addComment(uid, s) {
    if(!validate(['id','msg'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    const pdb = db.ref.p[s.id];
    if(!pdb) return helper.rep(400);
    if(s.msg.length > 300) return helper.rep(400, "POST_COMMENT_LENGTH");
    if(!pdb.c) db.ref.p[s.id].c = {};
    const cmtData = {};
    cmtData.u = uid;
    s.msg.replace(/\s/g, ' ');
    const transtxt = /(\s)(?=\s)/g;
    s.msg = s.msg.replace(transtxt, '').trim();
    cmtData.txt = helper.encryptData(s.msg);
    cmtData.ts = helper.encryptData(Date.now().toString());

    const newKey = 'c' + Date.now().toString(32);
    db.ref.p[s.id].c[newKey] = cmtData;
    db.save('p');
    return helper.rep(200, {id:newKey, u:{id:uid},txt:s.msg,ts:Date.now()});
  },
  removeComment(uid, s) {
    if(!validate(['id','cmt_id'], s)) return helper.rep(400);
    const pdb = db.ref.p[s.id]?.c?.[s.cmt_id];
    if(!pdb) return helper.rep(400);
    if(pdb.u !== uid) return helper.rep(403);

    delete db.ref.p[s.id].c[s.cmt_id];
    db.save('p');

    return helper.rep(200);
  }
}