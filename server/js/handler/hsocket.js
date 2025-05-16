const db = require("../db");
const hcloud = require("./hcloud");
const { validate } = require('../middlewares');
const hchat = require("./hchat");
const hpost = require("./hpost");
const helper = require("../helper");
const hprofile = require("./hprofile");

module.exports = {
  readMsg(uid, s) {
    hchat.readMsg(uid, s);
    return {data: [hcloud.getHeartbeat(uid)]};
  },
  receivedMsg(uid, s) {
    return {data: [hcloud.getHeartbeat(uid)]};
  },
  getTalks(uid, s) {
    return {data: [hcloud.getHeartbeat(uid)]};
  },
  postLike(uid, s) {
    hpost.postLike(uid, s);
    return {};
  },
  callPing(uid, s) {
    if(!validate(['id'], s)) return null;
    const cdb = db.ref.c;
    const friendId = Object.keys(cdb).find(k => cdb[k].u.includes(uid) && cdb[k].u.includes(s.id));
    if(!friendId) return null;
    const user = hprofile.getUser(uid, {id: s.id});
    if(!user || !user.peer) return null;

    return {data:[{name: "updatePeers", data: { friend_id: friendId, peer: user.peer }}]};
  },
  voiceCall(uid, s) {
    if(!validate(['id'], s)) return null;
    const vdb = db.ref.v;

    const callKey = Object.keys(vdb).find(k => {
      return vdb[k].u.find(usr => usr.id === uid) && vdb[k].u.find(usr => usr.id === s.id);
    });
    if(!callKey) return null;
    return {data:[
      {
        "name": "vcall",
        "data": vdb[callKey]
      }
    ]}
  },
  hangupCall(uid, s) {
    if(s.rj) {
      typeof s.rj === "number" ? s.rj = s.rj : s.rj = 0;
    }
    const vdb = db.ref.v;
    const cdb = db.ref.c;

    const myCalls = Object.keys(vdb).filter(k => {
      return vdb[k].u.find(usr => usr.id === uid);
    }).map(k => {
      const usr_arr = vdb[k].u;
      return {
        id: k, start_time: vdb[k].st, caller: usr_arr[0].id, receiver: usr_arr[1].id,
        user_id: usr_arr[0].id === uid ? usr_arr[1].id : usr_arr[0].id
      };
    });

    if(myCalls.length < 1) return null;

    myCalls.forEach(k => {
      delete db.ref.v[k.id];
    });

    const myChatList = myCalls.map(k => {
      const chatKey = Object.keys(cdb).find(ch => {
        return cdb[ch].u.includes(k.user_id) && cdb[ch].u.includes(uid);
      });
      return {
        chat_key: chatKey,
        caller: k.caller,
        start_time: k.start_time,
        receiver: k.receiver
      }
    });

    myChatList.forEach(k => {
      const newKey = 'c' + Date.now().toString(32);
      if(!db.ref.c[k.chat_key].c) db.ref.c[k.chat_key].c = {};
      const chatCount = Object.keys(db.ref.c[k.chat_key].c).length;
      db.ref.c[k.chat_key].c[newKey] = {
        u: k.caller,
        vc: 1,
        rj: s.rj,
        dur: helper.encryptData((k.start_time ? Date.now() - k.start_time : 0).toString()),
        ts: helper.encryptData(Date.now().toString()),
        w: []
      };
      [k.receiver, k.caller].forEach(user_id => {
        const sdb = db.ref.u[user_id];
        if(!sdb.zzz) db.ref.u[user_id].zzz = [];
        db.ref.u[user_id].zzz.push({
          u: k.caller,
          t: helper.encryptData(chatCount > 0 ? 'chat_new' : 'room'),
          r: helper.encryptData('chats'),
          k: helper.encryptData(k.chat_key),
          c: helper.encryptData(newKey)
        });
      });
    });

    db.save('v', 'c');
    return {data: [hcloud.getHeartbeat(uid)]};
  },
  callMicOff(uid, s) {
    if(!validate(['id'], s)) return null;
    const vdb = db.ref.v;
    const callKey = Object.keys(db.ref.v).find(k => {
      return vdb[k].u.find(usr => usr.id === uid) && vdb[k].u.find(usr => usr.id === s.id);
    });
    if(!callKey) return null;

    const usrIdx = vdb[callKey].u.findIndex(usr => usr.id === uid);
    db.ref.v[callKey].u[usrIdx].micOff = true;
    db.save('v');
    return null;
  },
  callMicOn(uid, s) {
    if(!validate(['id'], s)) return null;
    const vdb = db.ref.v;
    const callKey = Object.keys(db.ref.v).find(k => {
      return vdb[k].u.find(usr => usr.id === uid) && vdb[k].u.find(usr => usr.id === s.id);
    });
    if(!callKey) return null;

    const usrIdx = vdb[callKey].u.findIndex(usr => usr.id === uid);

    if(vdb[callKey].u[usrIdx].micOff) {
      db.ref.v[callKey].u[usrIdx].micOff = false;
      db.save('v');
    }
    return null;
  },
  callVolOff(uid, s) {
    if(!validate(['id'], s)) return null;
    const vdb = db.ref.v;
    const callKey = Object.keys(vdb).find(k => {
      return vdb[k].u.find(usr => usr.id === uid) && vdb[k].u.find(usr => usr.id === s.id);
    });
    if(!callKey) return null;
    const usrIdx = vdb[callKey].u.findIndex(usr => usr.id === uid);
    db.ref.v[callKey].u[usrIdx].volOff = true;
    db.save('v');
    return null;
  },
  callVolOn(uid, s) {
    if(!validate(['id'], s)) return null;
    const vdb = db.ref.v;
    const callKey = Object.keys(db.ref.v).find(k => {
      return vdb[k].u.find(usr => usr.id === uid) && vdb[k].u.find(usr => usr.id === s.id);
    });
    if(!callKey) return null;
    const usrIdx = vdb[callKey].u.findIndex(usr => usr.id === uid);
    if(vdb[callKey].u[usrIdx].volOff) {
      db.ref.v[callKey].u[usrIdx].volOff = false;
      db.save('v');
    }
    return null;
  },
  run(uid, s = {}) {
    if(this[s.id]) return this[s.id](uid, s.data);
    return {code:400};
  }
};