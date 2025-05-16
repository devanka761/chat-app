import Find from "../pmm/Find.js";
import Chats from "../pmm/Chats.js";
import Friends from "../pmm/Friends.js";
import Grps from "../pmm/Grps.js";
import userState from "../../manager/userState.js";
import Posts from "../pmb/Posts.js";
import Calls from "../pmm/Calls.js";
import { destroyPM, fRemovePM, isNarrow, setQueue } from "../../manager/nrw.js";

export default [
  { id:'find', text:`<i class="fa-solid fa-magnifying-glass"></i><p>APP_SEARCH</p>`, async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Find().run();
    userState.locked.mid = false;
  }},
  { id:'chats', text:'<i class="fa-solid fa-comments"></i><p>APP_CHATS</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Chats().run();
    userState.locked.mid = false;
  }},
  { id:'friends', text:'<i class="fa-solid fa-address-book"></i><p>APP_FRIENDS</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Friends().run();
    userState.locked.mid = false;
  }},
  { id:'groups', text:'<i class="fa-solid fa-users"></i><p>APP_GROUPS</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Grps().run();
    userState.locked.mid = false;
  } },
  { id:'calls', text:'<i class="fa-solid fa-phone"></i><p>APP_CALLS</p>', async run() {
    if(userState.locked.mid) return;
    userState.locked.mid = true;
    await userState.pmmid?.destroy?.();
    new Calls().run();
    userState.locked.mid = false;
  } },
  { id:'posts', text:'<i class="fa-solid fa-camera-polaroid"></i><p>APP_POSTS</p>', async run() {
    if(userState.locked.bottom) return;
    userState.locked.bottom = true;
    await userState.pmbottom?.destroy?.();
    if(isNarrow) {
      setQueue();
      await destroyPM();
      fRemovePM();
    }
    new Posts().run();
    userState.locked.bottom = false;
  }, noactive: true },
]