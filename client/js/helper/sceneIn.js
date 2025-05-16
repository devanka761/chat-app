import modal from "./modal.js";

export default async function(el) {
  return new Promise(async resolve => {
    el.classList.add('in');
    await modal.waittime();
    el.classList.remove('in');
    resolve();
  });
}