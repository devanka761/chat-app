const fs = require('fs');
const db = require('../db');

module.exports = {
  user(s) {
    if(!fs.existsSync(`./server/dbfile/user/${s}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/user/${s}`}};
  },
  group(s, req) {
    const gdb = db.ref.g;
    let getAccess = false;
    if(req.query) {
      req.query = req.query.toLowerCase();
      const gkey = Object.keys(gdb).find(k => gdb[k].l === req.query);
      if(gkey) getAccess = true;
    }
    if(req.uid) {
      const gkey = s.split('_')[0];
      if(gdb[gkey] && gdb[gkey].u.includes(req.uid)) getAccess = true;
    }
    if(!getAccess) return {code:403};
    if(!fs.existsSync(`./server/dbfile/group/${s}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/group/${s}`}};
  },
  content(uid, s) {
    const userAllow = db.ref.c[s.id]?.u?.find(k => k === uid) || db.ref.g[s.id]?.u?.find(k => k === uid) || (s.id === 'zzz' && db.ref.g[s.id]) || null;
    if(!userAllow) return {code:403};
    if(!fs.existsSync(`./server/dbfile/content/${s.id}/${s.name}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/content/${s.id}/${s.name}`}};
  },
  post(s) {
    if(!fs.existsSync(`./server/dbfile/post/${s}`)) return {code:404};
    return {code:200,data:{name:`./server/dbfile/post/${s}`}};
  }
}