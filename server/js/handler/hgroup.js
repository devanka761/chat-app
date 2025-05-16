const fs = require('fs');
const db = require("../db");
const { validate } = require('../middlewares');
const hprofile = require('./hprofile');
const helper = require('../helper');
const hchat = require('./hchat');

module.exports = {
  getGroup(uid, s, getFull = false) {
    if(!validate(['id'], s)) return {code: 400};
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    if(!gdb) return {code:404};
    const data = { o: gdb.o, n:helper.decryptData(gdb.n), id:s.id, t:gdb.t };
    if(getFull) {
      data.users = gdb.u.filter(k => hprofile.getUser(uid, {id:k})).map(k => {
        return hprofile.getUser(uid, {id:k});
      });
      if(getFull === 1) {
        data.chats = {};
        Object.keys(gdb.c).forEach(k => {
          data.chats[k] = hchat.getChat(uid, {ckey:'g', id:s.id, text_id:k});
        });
      }
    };
    if(gdb.i) data.i = helper.decryptData(gdb.i);
    if(gdb.o === uid || gdb.t === '0') data.l = gdb.l;
    if(gdb.b) data.b = gdb.b;
    return data;
  },
  getGroupDetail(uid, group_id) {
    const group = this.getGroup(uid, {id:group_id}, 2);
    if(!group?.users?.find(usr => usr.id === uid)) return helper.rep(403);
    if(group) return helper.rep(200, group);
    return helper.rep(404);
  },
  create(uid, s) {
    if(!validate(['name'], s)) return helper.rep(400);
    const transname = /(\s)(?=\s)/g;
    s.name = s.name.replace(transname, '').trim();

    const ogdb = db.ref.g;
    const oldGroups = Object.keys(ogdb).filter(k => ogdb[k].o === uid);

    if(oldGroups.length >= 2) return helper.rep(400, "GRPS_OWN_MAX");

    const gid = 'g' + Date.now().toString(32);

    const data = { o: uid, u: [uid], n: helper.encryptData(s.name), t: '1', c:{}};
    data.l = `${helper.rString(2)}_${Date.now().toString(32)}_${helper.rString(2)}`;
    db.ref.g[gid] = data;
    db.save('g');

    return helper.rep(200, this.getGroup(uid, {id:gid}, 1));
  },
  setImage(uid, s) {
    if(!validate(['id', 'img', 'name'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();

    const gdb = db.ref.g[s.id];
    if(!gdb || gdb.o !== uid) return helper.rep(400);

    const dataurl = decodeURIComponent(s.img);
    const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
    if(buffer.length > 2500000) return helper.rep(413, "ACC_FILE_LIMIT", {size:buffer.length});

    if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
    if(!fs.existsSync(`./server/dbfile/group`)) fs.mkdirSync(`./server/dbfile/group`);

    if(gdb.i) {
      gdb.i = helper.decryptData(gdb.i);
      if(fs.existsSync(`./server/dbfile/group/${gdb.i}`)) fs.unlinkSync(`./server/dbfile/group/${gdb.i}`);
    }

    const imgExt = /\.([a-zA-Z0-9]+)$/;
    const imgName = `${s.id}_${Date.now().toString(32)}.${s.name.match(imgExt)[1]}`;
    fs.writeFileSync(`./server/dbfile/group/${imgName}`, buffer);

    db.ref.g[s.id].i = helper.encryptData(imgName);
    db.save('g');

    return helper.rep(200);
  },
  setGname(uid, s) {
    if(!validate(['id','gname'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    if(gdb.o !== uid) return helper.rep(400);
    if(gdb.lg && gdb.lg > Date.now()) return helper.rep(429, gdb.lg);
    const transgname = /(\s)(?=\s)/g;
    s.gname = s.gname.replace(transgname, '').trim();
    if(s.gname === gdb.n) return helper.rep(200, {text:s.gname});
    if(s.gname.length > 35) return helper.rep(400, "GRPS_DNAME_LENGTH");
    const wsonly = /^\s+$/;
    if(wsonly.test(s.gname)) return helper.rep(200, {text:gdb.n});

    db.ref.g[s.id].n = helper.encryptData(s.gname);
    db.ref.g[s.id].lg = Date.now() + (1000*60*60*6);
    db.save('g');

    return helper.rep(200, {text:s.gname});
  },
  setType(uid, s) {
    if(!validate(['id','t'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    if(s.id === 'zzz') return helper.rep(403);
    const gdb = db.ref.g[s.id];
    if(gdb.o !== uid) return helper.rep(400);
    if(!['0','1'].includes(s.t)) return helper.rep(400);
    const glink = `${helper.rString(2)}_${Date.now().toString(32)}_${helper.rString(2)}`;
    if(gdb.t === s.t) {
      db.ref.g[s.id].l = glink;
      db.save('g');
      return helper.rep(200, {text:s.t,link:glink});
    }
    db.ref.g[s.id].t = s.t;
    db.ref.g[s.id].l = glink;
    db.save('g');

    return helper.rep(200, {text:s.t,link:glink});
  },
  leaveGroup(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase(400);
    if(s.id === 'zzz') return helper.rep(403);
    const gdb = db.ref.g[s.id];
    if(!gdb) return helper.rep(400);
    if(!gdb.u.includes(uid)) return helper.rep(400);
    db.ref.g[s.id].u = gdb.u.filter(k => k !== uid);
    db.save('g');

    return helper.rep(200);
  },
  delGroup(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    if(s.id === 'zzz') return helper.rep(403);
    const gdb = db.ref.g[s.id];
    if(!gdb) return helper.rep(400);
    if(gdb.o !== uid) return this.leaveGroup(uid, s);
    if(gdb.i) {
      gdb.i = helper.decryptData(gdb.i);
      if(fs.existsSync(`./server/dbfile/group/${gdb.i}`)) fs.unlinkSync(`./server/dbfile/group/${gdb.i}`);
    }
    if(fs.existsSync(`./server/dbfile/content/${s.id}`)) fs.rmSync(`./server/dbfile/content/${s.id}`, {recursive:true,force:true});

    delete db.ref.g[s.id];
    db.save('g');

    return helper.rep(200);
  },
  kickMember(uid, s) {
    if(!validate(['id', 'gid'], s)) return helper.rep(400);
    s.gid = s.gid.toLowerCase();
    const gdb = db.ref.g[s.gid];
    if(!gdb) return helper.rep(400);
    if(gdb.o !== uid) return helper.rep(403);
    if(!gdb.u.includes(s.id)) return helper.rep(400);

    db.ref.g[s.gid].u = gdb.u.filter(k => k !== s.id);
    db.save('g');
    return helper.rep(200, {user:{id:s.id}});
  },
  joinGroup(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    s.id = s.id.toLowerCase();
    const gdb = db.ref.g[s.id];
    if(!gdb) return helper.rep(404, "GRPS_404");
    if(gdb.u.includes(uid)) return helper.rep(200, this.getGroup(uid, {id:s.id}));
    if(gdb.t === '1') return helper.rep(403, "GRPS_TYPE_PRIVATE");

    db.ref.u[uid].zzz.push({
      u: uid,
      t: helper.encryptData('room'),
      r: helper.encryptData('groups'),
      k: helper.encryptData(s.id)
    });
    db.ref.g[s.id].u.push(uid);
    db.save('g');
    return helper.rep(200, this.getGroup(uid, {id:s.id}, 1));
  },
  joinPrivately(uid, plink) {
    if(!plink) return helper.rep(400);
    plink = plink.toLowerCase();
    const gdb = db.ref.g;
    const gkey = Object.keys(gdb).find(key => gdb[key].l === plink);
    if(!gkey) return helper.rep(404);

    if(gdb[gkey].u.includes(uid)) return helper.rep(200, {count:gdb[gkey].u.length});

    db.ref.g[gkey].u.push(uid);
    if(!db.ref.u[uid].zzz) db.ref.u[uid].zzz = [];
    db.ref.u[uid].zzz.push({
      u: uid,
      t: helper.encryptData('room'),
      r: helper.encryptData('groups'),
      k: helper.encryptData(gkey)
    });

    db.save('g');
    return helper.rep(200, {count:gdb[gkey].u.length});
  }
}