import ForceClose from "../app/main/ForceClose.js";
import pm from "../app/main/pm.js";
import sign from "../app/main/sign.js";
import cloud from "../manager/cloud.js";
import modal from "./modal.js";
import xhr from "./xhr.js";

export default async function() {
  const isUser = await modal.loading(xhr.get('/auth/isUser'));
  if(!isUser || isUser.code !== 200) return sign();
  const peerConn = await modal.loading(cloud.run(isUser.data.find(ls => ls.name === 'peersinit').data), 'CONNECTING');
  if(!peerConn || peerConn.done > 1) {
    return new ForceClose({locale:peerConn.msg,refresh:peerConn.done > 2}).run();
  }
  isUser.data.forEach(obj => cloud.clientData(obj));
  return new pm().run();
}