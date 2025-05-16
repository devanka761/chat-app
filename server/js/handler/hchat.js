const fs = require('fs');
const db = require("../db");
const {validate} = require('../middlewares');
const hprofile = require('./hprofile');
const helper = require('../helper');

function compareArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((value, index) => value === sorted2[index]);
};

function findMatchingGroup(group_us, group_all) {
  for (const [groupName, groupData] of Object.entries(group_all)) {
    if (compareArrays(group_us, groupData.u)) {
      return groupName;
    }
  }
  return null;
};

module.exports = {
  getChat(uid, s) {
    if(!validate(['ckey', 'id', 'text_id'], s)) return {code: 400};
    if(s.ckey !== 'c' && s.ckey !== 'g') return {code: 400};
    s.id = s.id.toLowerCase();
    const cdb = db.ref[s.ckey][s.id]?.c?.[s.text_id];
    if(!cdb) return {code: 400};

    const data = {};
    data.id = s.text_id;
    data.u = cdb.u === uid ? {id:uid} : {...hprofile.getUser(uid, {id:cdb.u})};
    data.ts = Number(helper.decryptData(cdb.ts));
    if(cdb.r) data.r = cdb.r;
    if(cdb.w) data.w = cdb.w;
    if(cdb.d) {
      data.d = Number(helper.decryptData(cdb.d));
    } else if(cdb.vc) {
      data.vc = cdb.vc;
      data.dur = Number(helper.decryptData(cdb.dur));
      data.rj = Boolean(cdb.rj);
    } else {
      if(cdb.v) data.v = helper.decryptData(cdb.v);
      if(cdb.txt) data.txt = helper.decryptData(cdb.txt);
      if(cdb.i) data.i = helper.decryptData(cdb.i);
      if(cdb.e) data.e = Number(helper.decryptData(cdb.e));
    }
    return data;
  },
  getPrivate(uid, s, getFull = false) {
    if(!validate(['id'], s)) return {code: 400};
    s.id = s.id.toLowerCase();
    const cdb = db.ref.c[s.id];
    const data = {id:s.id};
    if(getFull) {
      data.users = cdb.u.filter(k => k !== uid).map(k => hprofile.getUser(uid, {id:k}));
      data.chats = {};
      Object.keys(cdb.c).forEach(k => {
        data.chats[k] = this.getChat(uid, {ckey:'c', id:s.id, text_id:k});
      });
    };
    return data;
  },
  sendMessage(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400, {i:1});
    s.id = s.id.toLowerCase();
    if(typeof s?.conty !== 'number') return helper.rep(400, {i:2});
    const msgQueue = [false];
    const conty = s.conty === 1 ? 'c' : 'g';
    const cdb = db.ref[conty];
    let ckey = s.conty === 1 ? findMatchingGroup([uid, s.id], db.ref.c) : cdb[s.id] ? s.id : null;
    if(!ckey && conty === 'g') return helper.rep(400, {i:3});
    if(!ckey && conty === 'c') {
      ckey = 'm' + Date.now().toString(32);
      db.ref.c[ckey] = {};
      db.ref.c[ckey].u = [uid, s.id];
      db.ref.c[ckey].c = {};

      msgQueue.pop();
      msgQueue.push(true);
    }

    if(Object.keys(db.ref.c?.[ckey]?.c || {}).length < 1) {
      msgQueue.pop();
      msgQueue.push(true);
    }

    this.readMsg(uid, {id: ckey});
    if(!s.txt && !s.file && !s.voice) return helper.rep(400, {i:4});
    const data = {};
    data.u = uid;
    if(s.rep) {
      if(!validate(['rep'], s)) return helper.rep(400);
      if(cdb[ckey].c[s.rep] && !cdb[ckey].c[s.rep].vc) data.r = s.rep;
    }
    if(s.txt) {
      if(!validate(['txt'], s)) return helper.rep(400);
      const transtxt = /(\s)(?=\s)/g;
      s.txt = s.txt.replace(transtxt, '').trim();
      if(s.txt.length > 500) return helper.rep(400, "ERROR_TEXT_LENGTH");
      const wsonly = /^\s+$/;
      if(wsonly.test(s.txt)) return helper.rep(400);
      data.txt = helper.encryptData(s.txt);
    }
    if(s.edit) {
      s.edit = s.edit.toLowerCase();
      if(cdb[ckey].c[s.edit].d) return helper.rep(404);
      if(cdb[ckey].c[s.edit].v) return helper.rep(404);
      if(Date.now() > Number(helper.decryptData(cdb[ckey].c[s.edit].ts)) + (1000 * 60 * 15)) {
        return helper.rep(403, "CONTENT_EDIT_EXPIRED", {expired:1});
      }
      if(!cdb[ckey].c[s.edit]) return helper.rep(400);
      if(cdb[ckey].c[s.edit].v) return helper.rep(400);

      db.ref[conty][ckey].c[s.edit].txt = helper.encryptData(s.txt);
      db.ref[conty][ckey].c[s.edit].e = helper.encryptData(Date.now().toString());
      db.save(conty);

      const peers = db.ref[conty][ckey].u.filter(k => k !== uid && db.ref.u[k]?.peer)?.map(k => {
        return db.ref.u[k].peer;
      }) || [];

      (ckey === 'zzz' ? Object.keys(db.ref.u).map(k => k) : cdb[ckey].u).filter(k => k !== uid && db.ref.u[k].peer).forEach(k => {
        const sdb = db.ref.u[k];
        if(!sdb.zzz) db.ref.u[k].zzz = [];
        db.ref.u[k].zzz.push({
          u: uid,
          t: helper.encryptData('chat_edit'),
          r: helper.encryptData(conty === 'c' ? 'chats' : 'groups'),
          k: helper.encryptData(ckey),
          c: helper.encryptData(s.edit)
        })
      });

      return helper.rep(200, {
        chat: this.getChat(uid, {ckey:conty, id:ckey, text_id:s.edit}),
        peers
      });
    } else if(s.voice) {
      if(!validate(['voice'], s)) return helper.rep(400);
      const dataurl = decodeURIComponent(s.voice);
      const buffer = Buffer.from(dataurl.split(',')?.[1], 'base64');
      if(buffer.length > 2500000) return helper.rep(413, "ACC_FILE_LIMIT", {size:buffer.length});
      if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
      if(!fs.existsSync(`./server/dbfile/content`)) fs.mkdirSync(`./server/dbfile/content`);
      if(!fs.existsSync(`./server/dbfile/content/${ckey}`)) fs.mkdirSync(`./server/dbfile/content/${ckey}`);
      const filename = `F${Date.now().toString(32)}.ogg`;
      fs.writeFileSync(`./server/dbfile/content/${ckey}/${filename}`, buffer);
      data.v = helper.encryptData(filename);
    } else if(s.file) {
      if(!validate(['name', 'src'], s.file)) return helper.rep(400);
      if(s.file.name.length > 100) return helper.rep(400, "FILENAME_LENGTH");
      const dataurl = decodeURIComponent(s.file.src);
      const buffer = Buffer.from(dataurl.split(',')?.[1], 'base64');
      if(buffer.length > 2500000) return helper.rep(413, "ACC_FILE_LIMIT", {size:buffer.length});

      if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
      if(!fs.existsSync(`./server/dbfile/content`)) fs.mkdirSync(`./server/dbfile/content`);
      if(!fs.existsSync(`./server/dbfile/content/${ckey}`)) fs.mkdirSync(`./server/dbfile/content/${ckey}`);
      const filename = `F${Date.now().toString(32)}_${s.file.name.replace(/\s/g, '_')}`;
      fs.writeFileSync(`./server/dbfile/content/${ckey}/${filename}`, buffer);
      data.i = helper.encryptData(filename);
    }

    data.ts = helper.encryptData(Date.now().toString());

    if(!db.ref[conty][ckey].c) db.ref[conty][ckey].c = {};
    const newKey = 'c' + Date.now().toString(32);

    db.ref[conty][ckey].c[newKey] = data;
    db.save(conty);

    const peers = ckey === 'zzz' ? Object.keys(db.ref.u).filter(k => k !== uid && db.ref.u[k].peer).map(k => db.ref.u[k].peer) || [] : db.ref[conty][ckey].u.filter(k => k !== uid && db.ref.u[k]?.peer)?.map(k => {
      return db.ref.u[k].peer;
    }) || [];

    (ckey === 'zzz' ? Object.keys(db.ref.u).map(k => k) : cdb[ckey].u).filter(k => k !== uid && db.ref.u[k].peer).forEach(k => {
      const sdb = db.ref.u[k];
      if(!sdb.zzz) db.ref.u[k].zzz = [];
      db.ref.u[k].zzz.push({
        u: uid,
        t: helper.encryptData(msgQueue[0] ? 'room' : 'chat_new'),
        r: helper.encryptData(conty === 'c' ? 'chats' : 'groups'),
        k: helper.encryptData(ckey),
        c: helper.encryptData(newKey)
      })
    });

    return helper.rep(200, {
      chat: {...this.getChat(uid, {ckey:conty, id:ckey, text_id:newKey}), ckey},
      peers
    });
  },
  delMessage(uid, s) {
    if(!validate(['id', 'text_id'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    s.text_id = s.text_id.toLowerCase();
    if(typeof s?.conty !== 'number') return helper.rep(400);
    const conty = s.conty === 1 ? 'c' : 'g';
    const cdb = db.ref[conty];
    let ckey = s.conty === 1 ? findMatchingGroup([uid, s.id], db.ref.c) : cdb[s.id] ? s.id : null;
    if(!ckey) return helper.rep(404);
    this.readMsg(uid, {id: ckey});

    if(!cdb[ckey].c[s.text_id]) return helper.rep(400, {text_id:s.text_id});

    if(cdb[ckey].c[s.text_id].vc) return helper.rep(403, {text_id:s.text_id});

    if(cdb[ckey].c[s.text_id].e) delete db.ref[conty][ckey].c[s.text_id].e;

    db.ref[conty][ckey].c[s.text_id].d = helper.encryptData(Date.now().toString());

    const newData = {...db.ref[conty][ckey].c[s.text_id]};
    if(newData.txt) {
      delete db.ref[conty][ckey].c[s.text_id].txt;
      delete newData.txt;
    }
    if(newData.v) {
      newData.v = helper.decryptData(newData.v);
      if(fs.existsSync(`./server/dbfile/content/${ckey}/${newData.v}`)) fs.unlinkSync(`./server/dbfile/content/${ckey}/${newData.v}`);
      delete db.ref[conty][ckey].c[s.text_id].v;
      delete newData.v;
    }
    if(newData.i) {
      newData.i = helper.decryptData(newData.i);
      if(fs.existsSync(`./server/dbfile/content/${ckey}/${newData.i}`)) fs.unlinkSync(`./server/dbfile/content/${ckey}/${newData.i}`);
      delete db.ref[conty][ckey].c[s.text_id].i;
      delete newData.i;
    }

    db.save(conty);

    const peers = ckey === 'zzz' ? Object.keys(db.ref.u).filter(k => k !== uid && db.ref.u[k].peer).map(k => db.ref.u[k].peer) || [] : db.ref[conty][ckey].u.filter(k => k !== uid && db.ref.u[k]?.peer)?.map(k => {
      return db.ref.u[k].peer;
    }) || [];

    (ckey === 'zzz' ? Object.keys(db.ref.u).map(k => k) : cdb[ckey].u).filter(k => k !== uid && db.ref.u[k].peer).forEach(k => {
      const sdb = db.ref.u[k];
      if(!sdb.zzz) db.ref.u[k].zzz = [];
      db.ref.u[k].zzz.push({
        u: uid,
        t: helper.encryptData('chat_edit'),
        r: helper.encryptData(conty === 'c' ? 'chats' : 'groups'),
        k: helper.encryptData(ckey),
        c: helper.encryptData(s.text_id)
      })
    });

    return helper.rep(200, {
      chat: this.getChat(uid, {ckey:conty, id:ckey, text_id:s.text_id}),
      peers
    });
  },
  readMsg(uid, s) {
    if(!validate(['id'], s)) return null;
    s.id = s.id.toLowerCase();
    if(s.id === 'zzz') return helper.rep(400);
    const child = db.ref.c[s.id] ? 'c' : db.ref.g[s.id] ? 'g' : null;
    if(!child) return helper.rep(400);

    const cdb = db.ref[child][s.id];
    if(!cdb.c) return helper.rep(400);
    Object.keys(cdb.c).filter(k => cdb.c[k].u !== uid && (!cdb.c[k].w || !cdb.c[k].w.includes(uid))).forEach(k => {
      if(!db.ref[child][s.id].c[k].w) db.ref[child][s.id].c[k].w = [];
      db.ref[child][s.id].c[k].w.push(uid);
    });
    cdb.u.filter(k => {
      const sdb = db.ref.u[k];
      const samePath = (sdb.zzz || []).find(ch => {
        return helper.decryptData(ch.t) === 'read_msg' && helper.decryptData(ch.k) === s.id;
      });
      return k !== uid && sdb.peer && !samePath;
    }).forEach(k => {
      const sdb = db.ref.u[k];
      if(!sdb.zzz) db.ref.u[k].zzz = [];
      db.ref.u[k].zzz.push({
        u: uid,
        t: helper.encryptData('read_msg'),
        r: helper.encryptData(child === 'c' ? 'chats' : 'groups'),
        k: helper.encryptData(s.id)
      });
    });
    db.save(child);
  }
}