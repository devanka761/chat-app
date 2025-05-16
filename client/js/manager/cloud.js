import { Peer } from "peerjs";
import db from "./db.js";
import xhr from "../helper/xhr.js";
import elgen from "./elgen.js";
import userState from "./userState.js";
import { ReceiveCall, currcall } from "../app/call/Call.js";
import notip from "../helper/notip.js";
import ForceClose from "../app/main/ForceClose.js";

let lang = {};
let connectedToPeer = {
  done: 0,
  msg: null,
  interval: null
}

let reqtimeout = null;
const rtime = 7000;

const mapPair = {i:0,d:0};

async function waittime(ms = 200) {return new Promise(resolve => setTimeout(resolve, ms))}
// this.peer.socket._socket.send(JSON.stringify({selfadded: {data:"aaw"}}));
class cloud {
  constructor() {
    this.pair = new Map();
    this.isStopped = 0;
    this.to = { cht: new Set() };
  }
  processData(s) {
    if(s.id === 'send-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
      if(userState.pmbottom?.id === 'content') return;
      if(this.to.cht.has(s.data.chat_id)) {
        setTimeout(() => this.to.cht.delete(s.data.chat_id), 5000);
        return;
      }
      const chatKey = db.ref.groups[s.data.chat_id] ? 2 : db.ref.chats[s.data.chat_id] ? 1 : 0;
      const chatData = db.ref.chats[s.data.chat_id] || db.ref.groups[s.data.chat_id] || null;
      if(!chatData) s.data.chat_id = 'unknownID';
      
      const knownUser = chatData?.users.find(usr => usr.id === s.from)?.[('username' || 'n')] || lang.SOMEONE;
      const knownChat = chatKey >= 2 ? db.ref.groups[s.data.chat_id].n : knownUser;
      const knownText = s.data.text || lang.NOTIP_RECEIVE_MSG;

      const dtxt = elgen.ss(`${chatKey >= 2 ? knownUser + ': ' : ''}${knownText}`, 30);

      if(userState.notif.a01) {
        this.to.cht.add(s.data.chat_id);
        setTimeout(() => this.to.cht.delete(s.data.chat_id), 5000);
        notip({ ic:'comment-dots', a: knownChat, b: dtxt, c: 1 });
      }
    } else if(s.id === 'update-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
    } else if(s.id === 'read-msg') {
      this.peer.socket._socket.send(JSON.stringify({d761: {id:'receivedMsg'}}));
    } else if(s.id === 'voice-call') {
      ReceiveCall(s.from, userState.notif.a03 ? false : true);
    } else if(s.id.includes('act-call')) {
      if(currcall) currcall.updateActions(s);
    } else if(s.id === 'decline-call') {
      if(currcall) currcall.actionHangup();
    }
  }
  clientData(obj) {
    if(obj.code && obj.code !== 200) return;

    if(obj.name === 'account') {
      if(userState.pmmid?.id !== 'friends' && userState.notif.a02) {
        if(obj.data.req?.length > (db?.ref?.account?.req?.length || 0)) {
          notip({ ic:'face-sunglasses', a: lang.NOTIP_FRIENDS_REQ_TITLE, b: lang.NOTIP_FRIENDS_REQ_DESC.replace(/{n}/, obj.data.req.length)});
        }
      }
    }

    if(['chats', 'friends', 'groups', 'account', 'vcall'].includes(obj.name)) {
      db.ref[obj.name] = obj.data;
    }
    if(obj.name === 'updatePeers') {
      const fdb = db.ref.friends;
      const ckey = fdb[obj.data.friend_id];
      if(ckey) {
        db.ref.friends[obj.data.friend_id].peer = obj.data.peer;
      }
    }

    if(obj.name === 'heartbeat') {
      if(db.ref.account) {
        Object.keys(obj.data).filter(k => k !== 'zzz' && k !== 'req').forEach(k => {
          db.ref.account[k] = obj.data[k];
        });
      }
      if(obj.data.req?.length > (db?.ref?.account?.req?.length || 0)) {
        db.ref.account.req = obj.data.req;
        if(userState.pmmid?.id !== 'friends' && userState.notif.a02) {
          notip({ ic:'face-sunglasses', a: lang.NOTIP_FRIENDS_REQ_TITLE, b: lang.NOTIP_FRIENDS_REQ_DESC.replace(/{n}/, obj.data.req.length)});
        }
      }
      if(obj.data.zzz && obj.data.zzz.length >= 1) {
        db.updateHandelr(Object.values(obj.data.zzz));
        userState.pmbottom?.forceUpdate?.();
      }
      userState.pmmid?.forceUpdate?.();
      userState.pmtop?.forceUpdate?.();
    }
  }
  listenTo() {
    this.peer.on('call', async call => {
      if(currcall) currcall.answerUser(call);
    });
    this.peer.on('error', (err) => {
      if(currcall) currcall.actionHangup();
      if(err.type == 'browser-incompatible') {
        connectedToPeer.done = 2;
        connectedToPeer.msg = 'CLOUD_INCOMPATIBLE';
        this.forceClose('CLOUD_INCOMPATIBLE');
      } else {
        console.info(err);
        connectedToPeer.done = 3;
        connectedToPeer.msg = 'CLOUD_TIMEOUT';
        this.forceClose('CLOUD_TIMEOUT',1);
      }
    });

    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        console.info('connected_a', conn.peer);
        this.pair.set(conn.peer, conn);
        this.peer.socket._socket.send(JSON.stringify({d761:{id:"getTalks"}}));
      });
      conn.on('close', () => {
        if(currcall) currcall.actionHangup();
        console.info('disconnected_a', conn.peer);
        this.pair.delete(conn.peer);
      });
      conn.on('error', () => {
        if(currcall) currcall.actionHangup();
        console.info('error_a', conn.peer);
      });
      conn.on('data', (data) => this.processData(data));

      window.addEventListener('unload', () => conn.close());
    });

    this.peer.once('open', () => {
      connectedToPeer.done = 1;
      this.peer.socket._socket.addEventListener("message", (msg) => {
        if(msg.data) {
          if(reqtimeout) {
            clearTimeout(reqtimeout);
            reqtimeout = setTimeout(() => this.checkuser(), rtime);
          }
          JSON.parse(msg.data)?.data?.forEach(obj => this.clientData(obj));
        }
      });
    });
  }
  connectTo(id, currIndex, folFunc=null) {
    if(mapPair.d + 1 !== currIndex) return setTimeout(() => this.connectTo(id, currIndex, folFunc), 200);

    if(this.pair.has(id)) {
      mapPair.d++;
      if(mapPair.d === mapPair.i) {
        mapPair.i = 0;
        mapPair.d = 0;
      }
      if(folFunc) folFunc();
      return;
    }
    const conn = this.peer.connect(id);

    conn.on('open', () => {
      console.info('connected_b', conn.peer);
      this.pair.set(conn.peer, conn);
      mapPair.d++;
      if(mapPair.d === mapPair.i) {
        mapPair.i = 0;
        mapPair.d = 0;
      }
      if(folFunc) folFunc();
    });
    conn.on('close', () => {
      if(currcall) currcall.actionHangup();
      console.info('disconnected_b', conn.peer);
      this.pair.delete(conn.peer);
    });
    conn.on('error', () => {
      if(currcall) currcall.actionHangup();
      console.info('error_b', conn.peer);
    });

    conn.on('data', (data) => this.processData(data));

    window.addEventListener('unload', () => conn.close());
  }
  call(peerid, usermedia) {
    const conncall = this.peer.call(peerid, usermedia);
    return conncall;
  }
  async send({id,to,data=null}) {
    if(typeof to === "string") to = [to];
    for(const peer of to) {
      mapPair.i++;
      if(this.pair.has(peer)) {
        this.pair.get(peer).send({id, from:db.ref.account.id, data});
      } else {
        this.connectTo(peer, mapPair.i, () => {
          this.pair.get(peer).send({id, from:db.ref.account.id, data});
        });
      }
    }
  }
  asend(id, data={}) {
    this.peer.socket._socket.send(JSON.stringify({d761: {id,data}}));
  }
  async checkuser() {
    const stillUser = await xhr.get('/auth/stillUser');
    if(!stillUser || stillUser.code !== 200) {
      clearTimeout(reqtimeout);
      return this.forceClose('CLOUD_NETWORK_ERR',1);
    }
    if(stillUser.data.peer !== this.peerid) {
      clearTimeout(reqtimeout);
      return this.forceClose('CLOUD_SAME_TIME');
    }
  }
  async forceClose(msg='ERROR',tp=0) {
    if(!reqtimeout || this.isStopped) return;
    reqtimeout = null;
    this.peer.disconnect();
    this.peer.destroy();
    new ForceClose({locale:msg,refresh:tp}).run();
  }
  async run({ peerKey, peerid, peerConf }) {
    return new Promise(resolve => {
      lang = userState.langs[userState.lang];
      this.peerid = peerid;
      this.peer = new Peer(peerid, peerConf);
      this.listenTo();
      connectedToPeer.interval = setInterval(() => {
        if(connectedToPeer.done >= 1) {
          if(connectedToPeer.done === 1) {
            reqtimeout = setTimeout(() => this.checkuser(), rtime);
          }
          clearInterval(connectedToPeer.interval);
          connectedToPeer.interval = null;
          resolve({ msg: connectedToPeer.msg || 'ERROR', done: connectedToPeer.done });
        }
      }, 250);
  });
  }
}

export default new cloud();