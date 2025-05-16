import Empty from "../app/pmb/Empty.js";
import userState from "./userState.js";

const bottomclasses = ['settings', 'account', 'content', 'group_setting', 'posts', 'profile', 'createpost'];
const topclasses = ['calls', 'chats', 'friends', 'groups', 'find'];

export let isNarrow = false;
export let queue = {title:null,top:null,mid:null,bottom:null};

function onresize() {
  if(window.innerWidth <= 850) {
    if(!isNarrow) {
      isNarrow = true;
      if(bottomclasses.includes(userState.pmlast)) {
        setQueue();
        fRemovePM();
        destroyPM();
      } else if(topclasses.includes(userState.pmlast)) {
        if(userState.pmbottom) queue.bottom = userState.pmbottom;
        userState.pmbottom?.fRemove?.();
        userState.pmbottom?.destroy?.();
      }
    }
  } else {
    if(isNarrow) {
      isNarrow = false;
      const pmlist = [userState.pmbottom?.id, userState.pmmid?.id, userState.pmtop?.id, userState.pmtitle?.id];

      let makelast = null;
      if(userState.pmbottom?.id) {
        makelast = userState.pmbottom.id;
      } else if(userState.pmmid?.id) {
        makelast = userState.pmmid.id;
      }

      Object.values(queue).filter(k => k).forEach(k => {
        if(!pmlist.includes(k.id)) k.run();
      });

      userState.pmlast = makelast;
      Object.keys(queue).forEach(k => queue[k] = null);
    }
  }
}

export function fRemovePM() {
  userState.pmtitle?.fRemove?.();
  userState.pmtop?.fRemove?.();
  userState.pmmid?.fRemove?.();
}
export async function destroyPM() {
  userState.pmtitle?.destroy?.();
  userState.pmtop?.destroy?.();
  await userState.pmmid?.destroy?.();
}
export function setQueue() {
  Object.keys(queue).forEach(k => queue[k] = null);
  if(userState.pmmid) queue.mid = userState.pmmid;
  if(userState.pmtop) queue.top = userState.pmtop;
  if(userState.pmtitle) queue.title = userState.pmtitle;
}
export function setEmpty() {
  Object.keys(queue).forEach(k => queue[k] = null);
  queue.bottom = new Empty();
}
export function runQueue() {
  for(const arg of arguments) {
    queue[arg.type] = arg.class;
  }
  const pmlist = [userState.pmbottom?.id, userState.pmmid?.id, userState.pmtop?.id, userState.pmtitle?.id];

  Object.values(queue).filter(k => k).forEach(k => {
    if(!pmlist.includes(k.id)) k.run();
    if(k.id === 'nav' && topclasses.includes(queue.mid?.id)) {
      k.setSelection(queue.mid?.id);
    }
  });

  Object.keys(queue).forEach(k => queue[k] = null);
}
export function windowresize() {
  if(window.innerWidth <= 850) isNarrow = true;
  window.addEventListener('resize', onresize);
}