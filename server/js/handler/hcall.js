const fs = require('fs');
const helper = require('../helper');
const db = require('../db');
const { validate } = require('../middlewares');
const hprofile = require('./hprofile');

module.exports = {
  set(uid, s) {
    if(!validate(['id'], s)) return helper.rep(400);
    const vdb = db.ref.v;
    const cdb = db.ref.c;

    const oldCallKey = Object.keys(vdb).find(k => {
      return vdb[k].u.find(usr => usr.id === uid);
    });
    if(oldCallKey) {
      if(vdb[oldCallKey].u.find(usr => usr.id === uid)) return helper.rep(400);
    }

    const isBusy = Object.keys(vdb).find(k => {
      return vdb[k].u.find(usr => usr.id === s.id);
    });
    if(isBusy) return helper.rep(404, 'CALL_ANOTHER');

    const friendkey = Object.keys(cdb).find(k => {
      return cdb[k].u.includes(s.id) && cdb[k].u.includes(uid) && cdb[k].f;
    });
    if(!friendkey) return helper.rep(404);

    const callKey = 'vc' + Date.now().toString(32);
    db.ref.v[callKey] = {
      t: 0,
      o: Date.now() + (1000 * 10),
      st: 0, 
      u: [ { id: uid, j: true }, { id: s.id, j: false } ]
    };
    db.save('v');

    return helper.rep(200);
  },
  receive(uid, s) {
    if(!validate(['id'], s)) return null;

    const vdb = db.ref.v;

    const callKey = Object.keys(db.ref.v).find(k => {
      return vdb[k].u.find(usr => usr.id === uid) && vdb[k].u.find(usr => usr.id === s.id);
    });
    if(!callKey) return helper.rep(404);

    const vcdb = db.ref.v[callKey];
    if(Date.now() > vcdb.o) {
      delete db.ref.v[callKey];
      db.save('v');
      return helper.rep(400);
    }

    const user = hprofile.getUser(uid, {id:s.id});
    if(!user || !user.peer) return helper.rep(404);
    const data = {};
    data.peer = user.peer;

    const usrIdx = vcdb.u.findIndex(usr => usr.id === uid);
    db.ref.v[callKey].u[usrIdx].j = true;
    db.ref.v[callKey].st = Date.now();
    db.save('v');

    return helper.rep(200, data);
  }
}