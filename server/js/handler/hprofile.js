const db = require("../db");
const helper = require("../helper");
const {validate} = require('../middlewares');

module.exports = {
  getUser(uid, s) {
    if(!validate(['id'], s)) return null
    if(s.id === uid) return {id:uid};
    const udb = db.ref.u[s.id];
    if(!udb) return null;

    let data = {
      id: s.id, username: udb.uname,
      displayName: helper.decryptData(udb.dname),
    }
    if(udb.peer) data.peer = udb.peer;
    if(udb.bio) data.bio = helper.decryptData(udb.bio);
    if(udb.img) data.img = helper.decryptData(udb.img);
    if(udb.b) data.b = udb.b;
    if(udb.req && udb.req.includes(uid)) data.myreq = true;
    const mdb = db.ref.u[uid];
    if(mdb?.req && mdb.req.includes(s.id)) data.theirreq = true;
    const isFriend = Object.keys(db.ref.c).find(k => {
      return db.ref.c[k].u.includes(s.id) && db.ref.c[k].u.includes(uid) && db.ref.c[k].f;
    });
    if(isFriend) data.isfriend = true;
    return data;
  },
  getUserDetail(uid, user_id) {
    const user = this.getUser(uid, {id:user_id});
    if(user) return helper.rep(200, user);
    return helper.rep(404);
  },
  addFriend(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    if(s.id === uid) return helper.rep(400);
    const udb = db.ref.u[s.id];

    if(!udb) return helper.rep(400);

    if(db.ref.u[uid].req?.includes(s.id)) return this.acceptFriend(uid,s);
    if(udb?.req?.includes(uid)) return helper.rep(200, {user:this.getUser(uid,s)});

    if(!udb.req) db.ref.u[s.id].req = [];
    db.ref.u[s.id].req.push(uid);
    db.save('u');
    return helper.rep(200, {user:this.getUser(uid,s)});
  },
  unFriend(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    if(s.id === uid) return helper.rep(400);
    const udb = db.ref.u[s.id];
    if(!udb) return helper.rep(400);
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);
    const mdb = db.ref.u[uid];
    if(mdb.req?.includes(s.id)) db.ref.u[uid].req = mdb.req.filter(key => key !== s.id);

    const friendkey = Object.keys(db.ref.c).find(k => {
      return db.ref.c[k].u.includes(s.id) && db.ref.c[k].u.includes(uid) && db.ref.c[k].f;
    });
    if(friendkey) delete db.ref.c[friendkey].f;

    db.save('c','u');
    return helper.rep(200, {user:{...this.getUser(uid,s),chat_key:friendkey}});
  },
  acceptFriend(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    if(s.id === uid) return helper.rep(400);

    const mdb = db.ref.u[uid];
    if(!mdb) return helper.rep(400);
    if(!mdb.req || !mdb.req.includes(s.id)) return helper.rep(400, {user:this.getUser(uid,s)});

    const udb = db.ref.u[s.id];
    if(!udb) return helper.rep(400);
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);

    const chatkey = Object.keys(db.ref.c).find(k => {
      return db.ref.c[k].u.includes(s.id) && db.ref.c[k].u.includes(uid);
    });
    const new_chat_id = chatkey || 'm' + Date.now().toString(32);
    if(chatkey) {
      db.ref.c[chatkey].f = 1;
    } else {
      db.ref.c[new_chat_id] = { u: [s.id, uid], f: 1 }
    }

    db.ref.u[uid].req = mdb.req.filter(key => key !== s.id);
    if(!udb.zzz) db.ref.u[s.id].zzz = [];
    db.ref.u[s.id].zzz.push({
      u: uid,
      t: helper.encryptData('friendAccept'),
      k: helper.encryptData(new_chat_id)
    });
    db.save('c', 'u');

    return helper.rep(200, {user:{...this.getUser(uid, s),chat_key:chatkey}});
  },
  ignoreFriend(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    if(s.id === uid) return helper.rep(400);
    const udb = db.ref.u[s.id];
    if(!udb) return helper.rep(400);
    if(udb.req?.includes(uid)) db.ref.u[s.id].req = udb.req.filter(key => key !== uid);
    const mdb = db.ref.u[uid];
    if(mdb.req?.includes(s.id)) db.ref.u[uid].req = mdb.req.filter(key => key !== s.id);
    
    db.save('u');
    return helper.rep(200, {user:this.getUser(uid,s)});
  },
  cancelFriend(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    if(s.id === uid) return helper.rep(400);
    const udb = db.ref.u[s.id];
    if(!udb) return helper.rep(400);
    if(!udb.req || !udb.req.includes(uid)) return helper.rep(200, {user:this.getUser(uid,s)});
    db.ref.u[s.id].req = udb.req.filter(key => key !== uid);

    db.save('u');
    return helper.rep(200, {user:this.getUser(uid,s)});
  }
}