const db = require("./db");

const userCDs = new Map();

module.exports = {
  validate(requires, snap) {
    if(!snap) return false;
    const valids = requires.filter(s => {
      return Object.keys(snap).find(key => key == s && typeof snap[key] === 'string' && snap[key].length >= 1);
    });
    if(valids.length !== requires.length) return false;
    return true;
  },
  cdUser(req, res, next) {
    const uid = req.session?.user?.id || 'unknown';

    if(userCDs.has(uid)) {
      if(Date.now() <= userCDs.get(uid)) return res.status(429).json({code:429,msg:'TO_MANY_REQUEST'});
    }

    userCDs.set(uid, Date.now() + 2000);
    setTimeout(() => userCDs.delete(uid), 2000);
    return next();
  },
  isUser(req, res, next) {
    if(req.session?.user?.id) {
      if(db.ref.u[req.session.user.id]?.email) return next();
      return res.status(401).json({code:401,msg:'UNAUTHORIZED'});
    }
    return res.status(401).json({code:401,msg:'UNAUTHORIZED'});
  }
}