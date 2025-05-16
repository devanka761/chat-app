import modal from "../../helper/modal.js";
import xhr from "../../helper/xhr.js";
import sceneIn from "../../helper/sceneIn.js";
import userState from "../../manager/userState.js";
let lang = {};

export default class {
  constructor({classBefore}) {
    this.id = 'createpost';
    this.classBefore = classBefore;
    this.isLocked = false;
    this.file = { name: null, src: null, blob: null };
  }
  createElement() {
    this.el = document.createElement('div');
    this.el.classList.add('pmb', 'createpost');
    this.el.innerHTML = `
    <div class="posttitle">
      <div class="title">${lang.APP_POSTS}</div>
    </div>
    <div class="postcontainer">
      <div class="btn btn-choose-img">
        <i class="fa-solid fa-image"></i> ${lang.POSTS_CHOOSE_IMG}
      </div>
      <div class="post-img-preview"></div>
      <div class="post-text-preview">
        <textarea name="post-text" id="post-text" maxlength="500" placeholder="${lang.SAY_SOMETHING}"></textarea>
      </div>
    </div>
    <div class="postactions">
      <div class="btn btn-cancel-post"><i class="fa-solid fa-xmark"></i> ${lang.CANCEL.toLowerCase()}</div>
      <div class="btn btn-submit-post">${lang.POSTS_SHARE} <i class="fa-solid fa-arrow-up"></i></div>
    </div>`;
  }
  formListener() {
    const epostText = this.el.querySelector('#post-text');
    const btnSubmit = this.el.querySelector('.btn-submit-post');

    btnSubmit.onclick = async() => {
      if(this.isLocked) return;
      this.isLocked = true;
      if(!this.file.src || !this.file.name) {
        await modal.alert({ic:'circle-info', msg:lang.POST_NO_FILE});
        this.isLocked = false;
        return;
      }
      const postData = {};
      postData.filename = this.file.name;
      postData.filesrc = this.file.src;
      if((epostText.value || '').trim().length > 0) {
        postData.msg = epostText.value.trim();
      }

      const uploadPost = await modal.loading(xhr.post('/post/uwu/create', postData, '.loading .box p'), lang.UPLOADING);
      await modal.loading(modal.waittime(1000), lang.FINISHING);
      if(uploadPost?.code === 413) {
        await modal.alert(lang.ACC_FILE_LIMIT.replace(/{SIZE}/g, '2.5MB'));
        this.isLocked = false;
        return;
      }
      if(uploadPost?.code !== 200) {
        await modal.alert(lang[uploadPost.msg]?.replace(/{TEXT_LENGTH}/, '500') || lang.ERROR);
        this.isLocked = false;
        return;
      }
      this.isLocked = false;
      await this.destroy();
      this.classBefore.run();
    }
  }
  btnListener() {
    const btnChoose = this.el.querySelector('.btn-choose-img');
    btnChoose.onclick = async() => {
      if(this.isLocked) return;
      this.chooseImage();
    }
    const btnCancel = this.el.querySelector('.btn-cancel-post');
    btnCancel.onclick = async() => {
      await this.destroy();
      this.classBefore.run();
    }
  }
  async chooseImage(ms=null) {
    if(this.isLocked) return;
    if(ms) await modal.waittime(ms);
    const imgInp = document.createElement('input');
    imgInp.type = 'file';
    imgInp.accept = 'image/*';
    imgInp.onchange = async() => {
      const imgfile = imgInp.files[0];
      this.file.src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          return resolve(reader.result);
        }
        reader.readAsDataURL(imgfile);
      });
      this.file.name = imgfile.name;
      this.file.blob = URL.createObjectURL(imgfile);
      const eimgPreview = this.el.querySelector('.post-img-preview');
      const oimgs = eimgPreview.querySelectorAll('img');
      oimgs.forEach(oimg => oimg.remove());
      const img = new Image();
      img.alt = this.file.name;
      img.onerror = async() => {
        img.src = '/assets/error.jpg';
        Object.keys(this.file).forEach(k => this.file[k] = null);
        await modal.alert({msg:lang.IMG_ERR,ic:'image-slash'})
      }
      img.src = this.file.blob;
      eimgPreview.append(img);
    }
    imgInp.click();
  }
  fRemove() {
    this.isLocked = false;
    userState.pmbottom = null;
    userState.pmlast = null;
    Object.keys(this.file).forEach(k => this.file[k] = null);
    this.el.remove();
  }
  destroy() {
    return new Promise(async resolve => {
      this.el.classList.add('out');
      await modal.waittime();
      this.el.remove();
      this.isLocked = false;
      userState.pmbottom = null;
      userState.pmlast = null;
      Object.keys(this.file).forEach(k => this.file[k] = null);
      resolve();
    });
  }
  run() {
    userState.pmbottom = this;
    userState.pmlast = this.id;
    lang = userState.langs[userState.lang];
    this.createElement();
    document.querySelector('.app .pm').append(this.el);
    sceneIn(this.el);
    this.formListener();
    this.btnListener();
    this.chooseImage(145);
  }
}