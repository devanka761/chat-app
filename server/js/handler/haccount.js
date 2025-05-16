const fs = require('fs');
const db = require("../db");
const { validate } = require('../middlewares');
const helper = require('../helper');
module.exports = {
  setUsername(uid, s) {
    if(!validate(['uname'], s)) return helper.rep(400);

    const udb = db.ref.u[uid];
    if(udb.lu && udb.lu > Date.now()) return helper.rep(429, udb.lu);
    if(s.uname.length < 4 || s.uname.length > 20) return helper.rep(400, "ACC_FAIL_UNAME_LENGTH");

    const unamevalid = /^[A-Za-z0-9._]+$/;
    const unamedeny = /^user/;
    if(!s.uname.match(unamevalid)) return helper.rep(400, "ACC_FAIL_UNAME_FORMAT");
    if(s.uname.match(unamedeny)) return helper.rep(400, "ACC_FAIL_CLAIMED");
    if(['dvnkz','dvnkz_','devanka','devanka761','devanka7','devanka76'].includes(s.uname)) return helper.rep(400, "ACC_FAIL_CLAIMED");
    if(s.uname === udb.uname) return helper.rep(200, {text:s.uname});

    db.ref.u[uid].uname = s.uname;
    db.ref.u[uid].lu = Date.now() + (1000*60*60*24*7);
    db.save('u');

    return helper.rep(200, {text:s.uname});
  },
  setBio(uid, s) {
    if(!validate(['bio'], s)) return helper.rep(400);
    const udb = db.ref.u[uid];
    if(udb.lb && udb.lb > Date.now()) helper.rep(429, udb.lb);
    const transbio = /(\s)(?=\s)/g;
    s.bio = s.bio.replace(transbio, '').trim();
    if(s.bio === udb.bio) return helper.rep(200, {text:s.bio});
    if(s.bio.length > 200) return helper.rep(400, "ACC_FAIL_BIO_LENGTH");
    const wsonly = /^\s+$/;
    if(wsonly.test(s.bio)) return helper.rep(200, {text:udb.bio});

    db.ref.u[uid].bio = helper.encryptData(s.bio);
    db.ref.u[uid].lb = Date.now() + (1000*60*60);
    db.save('u');

    return helper.rep(200, {text:s.bio});
  },
  setDisplayName(uid, s) {
    if(!validate(['dname'], s)) return helper.rep(400);
    const udb = db.ref.u[uid];
    if(udb.ld && udb.ld > Date.now()) return helper.rep(429, udb.ld);
    const transdname = /(\s)(?=\s)/g;
    s.dname = s.dname.replace(transdname, '').trim();
    if(s.dname === udb.dname) return helper.rep(200, {text:s.dname});
    if(s.dname.length > 35) return helper.rep(400, "ACC_FAIL_DNAME_LENGTH");
    const wsonly = /^\s+$/;
    if(wsonly.test(s.dname)) return helper.rep(200, {text:udb.dname});

    db.ref.u[uid].dname = helper.encryptData(s.dname);
    db.ref.u[uid].ld = Date.now() + (1000*60*60*24*3);
    db.save('u');

    return helper.rep(200, {text:s.dname});
  },
  setImage(uid, s) {
    if(!validate(['img', 'name'], s)) return helper.rep(400);
    const dataurl = decodeURIComponent(s.img);
    const buffer = Buffer.from(dataurl.split(',')[1], 'base64');
    if(buffer.length > 2500000) return helper.rep(413, "ACC_FILE_LIMIT", {size:buffer.length});

    if(!fs.existsSync('./server/dbfile')) fs.mkdirSync('./server/dbfile');
    if(!fs.existsSync(`./server/dbfile/user`)) fs.mkdirSync(`./server/dbfile/user`);

    const udb = db.ref.u[uid];
    if(udb.img) {
      udb.img = helper.decryptData(udb.img);
      if(fs.existsSync(`./server/dbfile/user/${udb.img}`)) fs.unlinkSync(`./server/dbfile/user/${udb.img}`);
    }

    const imgExt = /\.([a-zA-Z0-9]+)$/;
    const imgName = `${uid}_${Date.now().toString(32)}.${s.name.match(imgExt)?.[1]}`;
    fs.writeFileSync(`./server/dbfile/user/${imgName}`, buffer);

    db.ref.u[uid].img = helper.encryptData(imgName);
    db.save('u');

    return helper.rep(200);
  },
}