const crypto = require('crypto');
module.exports = {
  peerKey:crypto.randomBytes(16).toString('hex'),
  genPeer() {
    return crypto.randomBytes(8).toString('hex') + Date.now().toString(32);
  },
  rep(code=400, msg=null, s=null) {
    if(typeof msg !== 'string') {
      s = msg;
      msg = null;
    }
    const data = {};
    data.ok = code >= 400 ? false : true;
    data.code = code;
    if(msg) data.msg = msg;
    else data.msg = code >= 400 ? 'ERROR' : 'OK';
    if(s) data.data = s;

    return data;
  },
  rString(n = 8) {
    return crypto.randomBytes(n).toString('hex');
  },
  rNumber(n = 6) {
     let a = "";
     for(let i = 1; i < n; i++) { a += "0"; }
     return Math.floor(Math.random() * Number("9" + a)) + Number("1" + a);
  },
  encryptData(plaintext) {
    const chatkey = Buffer.from(process.env.CHAT_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', chatkey, iv);
    const encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    const dataResult = encrypted + cipher.final('hex');
    return `${iv.toString('hex')}:${dataResult}`;
  },
  decryptData(ciphertext) {
    const chatkey = Buffer.from(process.env.CHAT_KEY, 'hex');
    const [ivHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', chatkey, iv);
    const decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    const dataResult = decrypted + decipher.final('utf-8');
    return dataResult;
  }
}