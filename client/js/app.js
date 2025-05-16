import "../scss/app.scss";
import checkuser from "./helper/checkuser.js";
import userState from "./manager/userState.js";

async function appInit() {
  const lang = {};
  for(const k of userState.langs) {
    lang[k] = await fetch(`../json/${k}.json`).then(rs => rs.json()).catch(()=>{});
  }
  userState.langs = lang;
  userState.load();

  document.querySelector('html').setAttribute('lang', userState.lang);

  checkuser();
}

appInit();