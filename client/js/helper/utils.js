export async function copyToClipboard(plaintext) {
  return await navigator.clipboard.writeText(plaintext).then(() => {
    return {ok:true,data:plaintext};
  }).catch(err => {
    console.log(err);
    return {ok:false,data:null};
  });
}