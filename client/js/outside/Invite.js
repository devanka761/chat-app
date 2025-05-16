import "../../scss/outsideapp.scss";
import nav from "./nav.js";
import modal from "../helper/modal.js";
import xhr from "../helper/xhr.js";

nav();

let isLocked = false;
const memberCount = document.querySelector('.title p');
const btnAccept = document.querySelector('#btn-accept');
if(btnAccept) btnAccept.onclick = async e => {
  e.preventDefault();
  if(isLocked) return;
  isLocked = true;
  btnAccept.disabled = true;
  btnAccept.innerText = 'JOINING...';
  await modal.waittime(995);
  const isJoin = await xhr.post(btnAccept.getAttribute('href'), {});
  if(isJoin?.code === 401) {
    btnAccept.innerHTML = 'PLEASE LOGIN TO CONTINUE';
    await modal.alert('You have to sign in before join the group');
    isLocked = false;
    window.location.href = `/app?r=1&type=${btnAccept.getAttribute('data-type')}&link=${btnAccept.getAttribute('data-link')}`;
    return;
  }
  if(isJoin?.code !== 200) {
    btnAccept.innerHTML = 'TRY AGAIN';
    await modal.alert('Error: Join the "Unknown Group"? Sorry..');
    isLocked = false;
    return;
  }

  memberCount.innerHTML = isJoin.data.count + ' member(s)<br/><span><i class="fa-duotone fa-circle-check"></i> joined</span>';
  const accpparent = btnAccept.parentElement;

  accpparent.innerHTML = '<a class="joined" href="/app?c=1&type=' + btnAccept.getAttribute('data-type') + '&id=' + btnAccept.getAttribute('data-id') + '">GO TO GROUP CHAT</a>';
  isLocked = false;
}