class Grup {
    constructor({uid, nama, foto, member, owner}) {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        this.uid = uid; // KEY GUILD
        this.nama = nama; // NAMA GUILD
        this.foto = foto; // FOTO GUILD
        this.member = member; // JUMLAH MEMBER
        this.owner = owner; // ID OWNER
        this.send = false; // SAMA DENGAN GLOBAL
        this.chunks = []; // SAMA DENGAN GLOBAL
        this.recorder = undefined; // SAMA DEGAN GLOBAL
    }

    createElement() { // SAMA DENGAN GLOBAL
        this.element = document.createElement("div");
        this.element.classList.add("Chat");
        this.element.innerHTML = (`
            <div class="head">
                <button class="btn-4 back">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="nama">
                    <img data-foto="${this.uid}" src="${this.foto}" width="25" height="25" />
                    <div data-nama="${this.uid}" ></div>
                </div>
                <button class="btn-4 report">
                    <i class="far fa-flag"></i>
                </button>
            </div>
            <div class="content"></div>
            <div class="foot">
                <div class="inputan">
                    <button class="btn-3 emoji">
                        <i class="fa-solid fa-face-mask"></i>
                    </button>
                    <input data-input="${auth.currentUser.uid}" type="text" placeholder="${this.selang.chat.inputPesan}" />
                    <button class="btn-3 foto" data-image="${auth.currentUser.uid}">
                        <i class="fa-solid fa-camera-retro"></i>
                    </button>
                </div>
                <div class="tombolan" data-button="${auth.currentUser.uid}">
                    <button class="btn-2 voice" data-klik="voice">
                        <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                    </button>
                    <button class="btn-2 send">
                        <i class="fa-solid fa-angles-right"></i>
                    </button>
                </div>
            </div>
        `);
        const nama = this.element.querySelector(`.head .nama [data-nama="${this.uid}"]`);
        nama.innerText = this.nama;
        this.element.querySelector(".head .back").onclick = () => this.back();
        
        // KALO NAMA GUILDNYA DIKLIK MAKA AKAN MEMBUKA RINICAN GUILDNYANYA
        nama.onclick = () => new Guild(this.uid, this.nama, this.foto, this.member, this.owner).init(document.querySelector(".container"));
        
        this.element.querySelector(".head .report").onclick = () => Notipin.Prompt({ // PROMPT REPORT
            msg: "DESKRIPSIKAN HAL MENARIK (BUG/HAL KURANG BAIK) YANG KAMU TEMUKAN",
            max: 500,
            textarea: true,
            mode: "dark",
            onYes: (res) => new Dashboard().report(res)
        });
    }
    
    scroll() { // SAMA KAYA GLOBAL
        this.element.querySelector(".content").scrollTop = this.element.querySelector(".content").scrollHeight;
    }

    loadChat() { // SAMA DENGAN GLOBAL
        rdb.ref("grup/" + this.uid).child("chat").limitToLast(50).on("value", (chat) => {
            this.element.querySelector(".content").innerHTML = '';
            chat.forEach(data => {
                const snap = data.val();
                if (snap.uid == auth.currentUser.uid) {
                    this.list = document.createElement("div");
                    this.list.classList.add("untai", "kita");
                    this.list.setAttribute("data-uid", data.key);
                    this.list.innerHTML = (`
                         <div class="untaian">
                            <div class="atas">
                                <button type="button" class="del" data-del="${data.key}">
                                    <i class="fas fa-trash-can"></i>
                                </button>
                                <div>Kamu</div>
                            </div>
                            <div class="pesan"></div>
                            <div class="bawah">
                                <div>${snap.jam}</div>
                                <div>•</div>
                                <div>${snap.tanggal}</div>
                            </div>
                        </div>
                        <div class="segitiga">
                        <i class="fas fa-triangle"></i>
                        </div>
                    `);
                    if(snap.pesan.indexOf("/gambarGP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `<img src="${snap.pesan}"/>`;
                    } else if(snap.pesan.indexOf("/suaraGP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `
                        <audio controls controlsList="nodownload"><source src="${snap.pesan}" type="audio/ogg"></audio>
                        `;
                    } else if(snap.pesan.indexOf("F?4?@)]CmKb?-{H_R") !== -1) {
                        this.list.querySelector(".atas .del").removeAttribute(`data-del`);
                        this.list.querySelector(".atas .del i").remove();
                        this.list.querySelector(".pesan").innerHTML = `<i class="error">${this.selang.chat.pesanTerhapus}</i>`;
                    } else {
                        this.list.querySelector(".pesan").innerText = snap.pesan;
                    }

                    if(this.list.querySelector(`.atas [data-del="${data.key}"]`)) {
                        this.list.querySelector(`.atas [data-del="${data.key}"]`).onclick = () => Notipin.Confirm({
                            msg: this.selang.chat.notipinTarik,
                            onYes: () => this.tarikChat(data.key, this.uid),
                            mode: "dark",
                            type: "danger"
                        })
                    }
                } else {
                    this.list = document.createElement("div");
                    this.list.classList.add("untai", "mereka");
                    this.list.setAttribute("data-uid", data.key);
                    this.list.innerHTML = (`
                    <div class="untaian">
                        <div class="atas">
                            <div class="nick" data-nama="${data.key}"></div>
                        </div>
                        <div class="pesan">
                        </div>
                        <div class="bawah">
                            <div>${snap.jam}</div>
                            <div>•</div>
                            <div>${snap.tanggal}</div>
                        </div>
                    </div>
                    <div class="segitiga">
                        <i class="fas fa-triangle"></i>
                    </div>
                    `);

                    const namaEl = this.list.querySelector(`.untaian .nick[data-nama="${data.key}"]`);
                    this.getName(namaEl, snap.uid)
                    if(snap.pesan.indexOf("/gambarGP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `<img src="${snap.pesan}"/>`;
                    } else if(snap.pesan.indexOf("/suaraGP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `
                        <audio controls controlsList="nodownload"><source src="${snap.pesan}" type="audio/ogg"></audio>
                        `;
                    } else if(snap.pesan.indexOf("F?4?@)]CmKb?-{H_R") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `<i class="error">${this.selang.chat.pesanTerhapus}</i>`;
                    } else {
                        this.list.querySelector(".pesan").innerText = snap.pesan;
                    }
                }
                this.element.querySelector(".content").appendChild(this.list);
            })
            this.scroll();
        })
    }

    getName(element, uid) { // SAMA DENGAN GLOBAL
        rdb.ref("users/" + uid).once("value", (data) => {
            const nama = data.val().nama?data.val().nama:data.val().displayName;
            element.innerText = nama;
            element.onclick = () => new Pengguna(uid).init(document.querySelector(".container"));
        })
    }

    tarikChat(untaikey, grupkey) { // SAMA DENGAN GLOBAL
        rdb.ref("grup/" + grupkey + "/chat/" + untaikey).once("value", (data) => {
            if(data.val().pesan.indexOf("/gambarGP") !== -1 || data.val().pesan.indexOf("/suaraGP") !== -1) {
                stg.ref(data.val().path).delete().then(() => {
                    rdb.ref("grup/" + grupkey + "/chat/" + untaikey).update({
                        pesan: "F?4?@)]CmKb?-{H_R"
                    });
                    rdb.ref("grup/" + grupkey + "/chat/" + untaikey+"/path").remove();
                }).catch(err => console.log(err));
            } else {
                rdb.ref("grup/" + grupkey + "/chat/" + untaikey).update({
                    pesan: "F?4?@)]CmKb?-{H_R"
                });
            }
        })
    }

    deteksiKirim() { // SAMA DENGAN GLOBAL
        const input = this.element.querySelector(`.foot .inputan [data-input="${auth.currentUser.uid}"]`);
        input.focus();
        const tombol = this.element.querySelector(`.foot .tombolan[data-button="${auth.currentUser.uid}"]`);
        input.onkeydown = () => {
            if (input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") {
                this.send = false;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                    </button>
                `);
            } else {
                this.send = true;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-angles-right"></i>
                    </button>
                `);
            }
        }
        input.onkeyup = () => {
            if (input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") {
                this.send = false;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                    </button>
                `);
            } else {
                this.send = true;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-angles-right"></i>
                    </button>
                `);
            }
        }
        input.onkeypress = (e) => {
            if(e.keyCode == 13) {
                if(input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") return;
                this.send = true;
                tombol.click();
            }
        }
        tombol.onclick = () => {
            if(this.send === true) {
                this.kirimChat(input.value.replace(/^\s+/g, ''));
                input.value = "";
                input.focus();
                tombol.innerHTML = (`
                <button class="btn-2" data-klik="voice">
                    <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                </button>
                `);
                this.send = false;
            } else {
                this.kirimVN(this.uid);
            }
        }

        const image = this.element.querySelector(`.foot .inputan [data-image="${auth.currentUser.uid}"]`);
        image.onclick = () => this.kirimFoto();
    }

    kirimFoto() { // SAMA DENGAN GLOBAL
        this.inputFoto = document.createElement("input");
        this.inputFoto.setAttribute("type", "file");
        this.inputFoto.setAttribute("data-picture", auth.currentUser.uid);
        this.inputFoto.setAttribute("accept", "image/*");
        this.inputFoto.click();
        this.inputFoto.onchange = () => this.submitFoto(this.uid);
    }

    submitFoto(chatkey) { // SAMA DENGAN GLOBAL
        const file = this.inputFoto.files[0];
        if (!file.type.match == 'image/*') return Notipin.Alert({msg: this.selang.chat.notipinTipeGambar, mode: "dark"});
        
        const uploading = document.createElement("div");
        uploading.classList.add("untai", "kita");
        uploading.innerHTML = (`
        <div class="untaian">
            <div class="pesan">${this.selang.chat.kirimGambar}</div>
        </div>
        <div class="segitiga">
            <i class="fas fa-triangle"></i>
        </div>
        `)
        this.element.querySelector(".content").appendChild(uploading);
        
        const fotoRef = stg.ref(`gambarGP/${auth.currentUser.uid}/${file.name}`);
        const fotoUp = fotoRef.put(file);

        fotoUp.on("state_changed", () => {}, err => {
            alert(err);
        }, () => {
            fotoUp.snapshot.ref.getDownloadURL().then(imgURL => {
                rdb.ref("grup/" + chatkey + "/chat").child(0 - new Date().getTime()).set({
                    uid: auth.currentUser.uid,
                    tanggal: tgl,
                    jam: jam,
                    pesan: imgURL,
                    path: `gambarGP/${auth.currentUser.uid}/${file.name}`
                });
            }).then(() => {
                uploading.remove();
            })
        })
        this.inputFoto.remove();
    }
    
    kirimChat(msg) { // SAMA DENGAN GLOBAL
        rdb.ref("grup/" + this.uid + "/chat").child(0 - new Date().getTime()).set({
            uid: auth.currentUser.uid,
            tanggal: tgl,
            jam: jam,
            pesan: msg,
        });
    }

    kirimVN(chatkey) { // SAMA DENGAN GLOBAL

        const logoMic = this.element.querySelector(`.tombolan [data-mic="${auth.currentUser.uid}"]`);

    let device = navigator.mediaDevices.getUserMedia({
        audio: true
    });
    device.then(stream => {
        if (this.recorder === undefined) {
            this.recorder = new MediaRecorder(stream);
            this.recorder.ondataavailable = e => {
                this.chunks.push(e.data);
                if (this.recorder.state === 'inactive') {
                    let blob = new Blob(this.chunks, {
                        type: 'audio/webm'
                    });
                    const element = this.element;
                    const reader = new FileReader();
                    reader.addEventListener("load", function () {

                        const uploading = document.createElement("div");
                        uploading.classList.add("untai", "kita");
                        uploading.innerHTML = (`
                        <div class="untaian">
                            <div class="pesan">${this.selang.chat.kirimVN}</div>
                        </div>
                        <div class="segitiga">
                            <i class="fas fa-triangle"></i>
                        </div>
                        `)
                        element.querySelector(".content").appendChild(uploading);

                        const storageRef = stg.ref(`suaraGP/${auth.currentUser.uid}/${tgl}.opus`);
                        const task = storageRef.put(e.data)

                        task.on('state_changed', function (snap) {}, function (error) {
                            alert(error.message)
                        }, function () {
                            task.snapshot.ref.getDownloadURL().then(audioUrl => {
                                rdb.ref("grup/" + chatkey + "/chat").child(0 - new Date().getTime()).set({
                                    uid: auth.currentUser.uid,
                                    tanggal: tgl,
                                    jam: jam,
                                    pesan: audioUrl,
                                    path: `suaraGP/${auth.currentUser.uid}/${tgl}.opus`
                                });
                            }).then(() => uploading.remove());
                        });
                    }, false);
                    reader.readAsDataURL(blob);
                }
            }
            this.recorder.start();
            logoMic.setAttribute('class', 'fas fa-stop');
        }
    });
    if (this.recorder !== undefined) {
        if (logoMic.getAttribute('class').indexOf('stop') !== -1) {
            this.recorder.stop();
            logoMic.setAttribute('class', 'fa-solid fa-microphone-lines');
        } else {
            this.chunks = [];
            this.recorder.start();
            logoMic.setAttribute('class', 'fa-solid fa-stop');
        }
    }
}

    back() { // SAMA DENGAN GLOBAL
        this.element.remove();
        new ListGrup().init(document.querySelector(".container"));
    }

    state() {
        // GANTI DAN TAMBAHKAN KE LAST ACTIVITY
        userState.changeLast("grup");
        userState.changeUID(this.uid);
        userState.changeNama(this.nama);
        userState.changeFoto(this.foto);
        userState.changeMember(this.member);
        userState.changeOwner(this.owner);
        // SIMPAN PERUBAHAN
        new Activity().save();
    }

    init(container) {
        // DIJALANKAN OTOMATIS SETELAH DIPANGGIL
        new Landing().end();
        this.createElement();
        container.appendChild(this.element);
        this.loadChat();
        this.deteksiKirim();
        this.state();
        new Dashboard().ukuranLayarChat();
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/