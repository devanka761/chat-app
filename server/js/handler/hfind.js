const db = require("../db");
const helper = require("../helper");
const hgroup = require("./hgroup");
const hprofile = require("./hprofile");

module.exports = {
  searchUsers(uid, q = null) {
    if(!q) return helper.rep(404, "FIND_NOTFOUND");
    if(q.length < 4) return helper.rep(400, "FIND_LENGTH");

    const udb = db.ref.u;
    const users = Object.keys(udb).filter(key => {
      return key !== uid && (key === q || udb[key].uname.includes(q));
    }).slice(0,9).map(key => {
      return hprofile.getUser(uid,{id:key});
    });
    return helper.rep(200, {users});
  },
  searchRandom(uid) {
    const udb = db.ref.u;
    const users = Object.keys(udb).filter(key => {
      return key !== uid;
    });
    const findArr = [];
    const randomUser = () => {
      const nwUser = users.filter(k => !findArr.includes(k));
      return nwUser[Math.floor(Math.random() * nwUser.length)];
    }
    const maxLength = users.length >= 3 ? 3 : users.length;
    for(let i=0;i<maxLength;i++) {
      findArr.push(randomUser());
    }
    const findUser = findArr.map(k => {
      return hprofile.getUser(uid, {id:k});
    });
    return helper.rep(200, {users:findUser});
  },
  groupInvite(uid=null, p = null) {
    if(!uid) uid = helper.rNumber(4).toString();
    if(!p) return helper.rep(404, {
      id: "-", link: "-", uname: 'Not Found', type: '-',
      imgsrc: '/assets/error.jpg',
      imgalt: 'not_found',
      desc: 'Invite: Not Found',
      accept: 0
    });

    const gdb = db.ref.g;
    const gkey = Object.keys(gdb).find(key => gdb[key].l === p);
    if(!gkey) return helper.rep(404, {
      id: "-", link: "-", uname: 'Invalid', type: '-',
      imgsrc: '/assets/error.jpg',
      imgalt: 'not_found',
      desc: 'This invite link is invalid or has expired',
      accept: 0
    });

    const group = hgroup.getGroup(uid, {id:gkey}, 1);
    if(group.code && group.code !== 200) return helper.rep(404, {
      id: "-", link: "-", uname: 'Not Found', type: '-',
      imgsrc: '/assets/error.jpg',
      imgalt: 'not_found',
      desc: 'This invite link is invalid or has expired',
      accept: 0
    });

    const groupData = {};
    groupData.id = group.id;
    groupData.link = p;
    groupData.type = 'g';
    groupData.imgalt = group.id;
    groupData.uname = group.n || 'Not Found';
    groupData.imgsrc = group.i ? '/file/group/' + group.i : '/assets/group.jpg';
    groupData.desc = group.users.length + ' member(s)';
    groupData.accept = group.users.find(usr => usr?.id === uid) ? -1 : 1;
    return helper.rep(200, groupData);
  }
}