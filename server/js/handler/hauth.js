const nodemailer = require('nodemailer');
const fs = require('fs');
const helper = require('../helper');
const db = require('../db');
const hcloud = require('./hcloud');
const { validate } = require('../middlewares');

// const mailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
// const usernameregex = /^[A-Za-z0-9_]+$/;
module.exports = {
  login(s) {
    if(!validate(['email'], s)) return helper.rep(400, "AUTH_ERR_01");
    const mailvalid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(!s.email.match(mailvalid)) return helper.rep(400, "AUTH_ERR_02");
    if(s.email.length > 200) return helper.rep(400, "AUTH_ERR_02");

    const oldEmailKey = Object.keys(db.ref.t).find(key => db.ref.t[key].email == s.email);

    const tempid = oldEmailKey ? oldEmailKey : 'u' + Date.now().toString(32);

    const gencode = helper.rNumber(6);
    if(!db.ref.t[tempid]) db.ref.t[tempid] = {
      email: s.email,
      otp: { code: gencode, expiry: Date.now() + (1000 * 60 * 10) },
      rate: 0,
    }
    if(db.ref.t[tempid].rate >= 3) {
      setTimeout(() => {
        delete db.ref.t[tempid];
      }, 1000 * 10);
    }
    if(db.ref.t[tempid].rate >= 4 || db.ref.t[tempid].cd >= 4) return helper.rep(429, "AUTH_RATE_LIMIT");
    db.ref.t[tempid].email = s.email;
    db.ref.t[tempid].otp = { code: gencode, expiry: Date.now() + (1000 * 60 * 10) };
    db.ref.t[tempid].rate = db.ref.t[tempid].rate + 1;

    emailCode(s.email, gencode);
    return helper.rep(200, {email:s.email});
  },
  verify(s) {
    if(!validate(['email'], s)) return helper.rep(400, "AUTH_ERR_01");
    const mailvalid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if(!s.email.match(mailvalid)) return helper.rep(400, "AUTH_ERR_02");
    if(s.email.length > 200) return helper.rep(400, "AUTH_ERR_02");
    if(typeof Number(s?.code) !== 'number') return helper.rep(400, "AUTH_ERR_03");
    s.code = Number(s.code);

    const tdb = db.ref.t;
    const dbkey = Object.keys(tdb).find(key => tdb[key].email == s.email);
    if(!dbkey) return helper.rep(400, "AUTH_ERR_04");
    if(tdb[dbkey]?.cd >= 3) {
      setTimeout(() => {
        delete db.ref.t[dbkey];
      }, 1000 * 10);
    }
    if(tdb[dbkey]?.cd >= 4) return helper.rep(429, "AUTH_RATE_LIMIT");
    db.ref.t[dbkey].cd = (db.ref.t[dbkey].cd || 0) + 1;

    if(tdb[dbkey].otp.code !== s.code) return helper.rep(400, "AUTH_ERR_04");
    if(tdb[dbkey].otp.expiry < Date.now()) return helper.rep(400, "AUTH_ERR_05", {restart:1});

    return this.processUser(s.email, dbkey);
  },
  processUser(email, dbkey) {
    const udb = db.ref.u;
    let data = { user: { email }}
    let ukey = Object.keys(udb).find(key => helper.decryptData(udb[key].email) == email);
    if(!ukey) {
      ukey = '7' + helper.rNumber(5).toString() + (Object.keys(udb).length + 1).toString();
      db.ref.u[ukey] = {
        uname:`user${ukey}`,
        email: helper.encryptData(email),
        bio: helper.encryptData('No bio yet.'),
        dname: helper.encryptData(`User D${ukey}`)
      };
      data.first = true;
      db.save('u');
    }

    data.user.id = ukey;

    delete db.ref.t[dbkey];

    data.cloud = hcloud.initPeers(ukey);
    return helper.rep(200, data);
  },
  getPeer(uid) {
    const udb = db.ref.u[uid];
    if(!udb) return helper.rep(400);
    if(!udb.peer) return helper.rep(400);
    
    return helper.rep(200, {peer:udb.peer});
  }
}

const emailQueue = { index: 0, done: 0 };

function emailCode(user_email, gen_code) {
  emailQueue.index++;
  sendEmailCode(emailQueue.index, user_email, gen_code);
};

function sendEmailCode(emailIndex, user_email, gen_code) {
  if(emailQueue.done + 1 !== emailIndex) {
    return setTimeout(() => sendEmailCode(emailIndex, user_email, gen_code), 200);
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const email_file = fs.readFileSync('./server/html/email_login.ejs', 'utf8').replace(/{GEN_CODE}/g, gen_code);

  transport.sendMail({
    from: `"Kirimin" <${process.env.SMTP_USER}>`,
    to: user_email,
    subject: `Your login code is ${gen_code}`,
    html: email_file
  }).catch((err) => {
    console.log(err);
  }).finally(() => {
    transport.close();
    emailQueue.done++;
    if(emailQueue.done === emailQueue.index) {
      emailQueue.index = 0;
      emailQueue.done = 0;
    }
  });
}