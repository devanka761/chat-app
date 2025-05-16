const db = require("../db");
const helper = require("../helper");
const { genPeer, peerKey } = require("../helper");
const hchat = require("./hchat");
const hgroup = require("./hgroup");
const hprofile = require("./hprofile");

const isProduction = process.env.APP_PRODUCTION.toString();

module.exports = {
  initPeers(uid) {
    const peerid = genPeer();
    db.ref.u[uid].peer = peerid;

    const peerConf = {
      host: isProduction == 'true' ? process.env.TURN_HOST : process.env.APP_HOST,
      port: isProduction == 'true' ? '' : Number(process.env.APP_PORT),
      key: peerKey,
      path: 'cloud',
    };

    if(isProduction == 'true') peerConf.config = {
      "iceServers": [
        { urls: `stun:${process.env.TURN_HOST}:${process.env.TURN_PORT}` },
        {
          urls: `turn:${process.env.TURN_HOST}:${process.env.TURN_PORT}`,
          username: process.env.TURN_USERNAME,
          credential: process.env.TURN_PASSWORD
        }
      ]
    }

    return [...this.getAll(uid), {name:'peersinit', data: { peerKey, peerid, peerConf }}];
  },
  getAccount(uid) {
    const udb = db.ref.u[uid];
    if(!udb) return {};

    const myAccount = {};
    myAccount.email = helper.decryptData(udb.email);
    myAccount.username = udb.uname;
    myAccount.displayName = helper.decryptData(udb.dname);
    myAccount.bio = helper.decryptData(udb.bio);
    myAccount.id = uid;

    if(udb.b) myAccount.b = udb.b;
    if(udb.img) myAccount.img = helper.decryptData(udb.img);
    if(udb.req) myAccount.req = udb.req.map(k => hprofile.getUser(uid, {id:k}));
    if(udb.zzz) {
      myAccount.zzz = udb.zzz.map((s,i) => {
        Object.keys(s).forEach(skey => {
          if(skey !== 'u') s[skey] = helper.decryptData(s[skey]);
        });
        if(s.t === 'room') {
          return {
            user: s.u,
            type: s.t,
            room: s.r,
            chat_id: s.k,
            data: s.r === 'groups' ? hgroup.getGroup(uid, {id:s.k}, 1) : hchat.getPrivate(uid, {id:s.k}, 1)
          }
        } else if(s.t.includes('chat')) {
          const _chat = hchat.getChat(uid, {
            "ckey": s.r === "groups" ? "g" : "c",
            "id": s.k,
            "text_id": s.c
          });
          return {
            users: s.u,
            type: s.t,
            room: s.r,
            chat_id: s.k,
            text_id: s.c,
            data: _chat
          }
        } else if(s.t === 'read_msg') {
          return {
            users: s.u,
            type: s.t,
            room: s.r,
            chat_id: s.k
          }
        } else if(s.t === 'profile') {
          return {
            type: s.t,
            user: s.u,
            room: s.r,
            data: s.r === 'groups' ? hgroup.getGroup(uid, { "id": s.u }) : hprofile.getUser(uid, { "id": s.u })
          }
        } else if(s.t === 'friendAccept') {
          return {
            type: s.t,
            user: s.u,
            friend_id: s.k,
            data: hprofile.getUser(uid, { "id": s.u })
          }
        }
      });
      db.ref.u[uid].zzz = [];
    }
    return myAccount;
  },
  getHeartbeat(uid) {
    return { name: "heartbeat", data: this.getAccount(uid)};
  },
  getAll(uid) {
    const cdb = db.ref.c;
    const myChats = {};
    Object.keys(cdb).filter(k => {
      return cdb[k].u.includes(uid) && cdb[k].c;
    }).forEach(k => {
      myChats[k] = hchat.getPrivate(uid, {id: k}, 1);
    });

    const myFriends = {};
    Object.keys(cdb).filter(k => {
      return cdb[k].u.includes(uid) && cdb[k].f;
    }).forEach(k => {
      myFriends[k] = hprofile.getUser(uid,{id:cdb[k].u.find(ck => ck !== uid)});
    });

    const gdb = db.ref.g;
    const myGroups = {};
    Object.keys(gdb).filter(k => {
      return (gdb[k].u.includes(uid) && !hgroup.getGroup(uid, {id:k})?.code) || k === 'zzz'
    }).forEach(k => {
      myGroups[k] = hgroup.getGroup(uid, {id:k}, 1);
    });

    return [
      { name: "chats", data: myChats },
      { name: "friends", data: myFriends },
      { name: "groups", data: myGroups },
      { name: "account", data: this.getAccount(uid) }
    ];
  }
}