class Pesan {
    constructor({
        uid,
        nama,
        foto
    }) {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        this.uid = uid; // KEY LAWAN CHAT
        this.nama = nama; // NAMA LAWAN CHAT
        this.foto = foto; // FOTO LAWAN CHAT
        this.send = false; // TOMBOL KIRIM DEFAULT FALSE
        this.temanId = ''; // SUPAYA TIDAK UNDEFINED
        this.chatKey = ''; // SUPAYA TIDAK UNDEFINED
        this.chunks = []; // SUPAYA TIDAK UNDEFINED
        this.recorder = undefined; // MEMANG DIBUAT SUPAYA UNDEFINED UNTUK DEFAULTNYA :V (WKWK)
    }

    createElement() {
        // DIV BARU UNTUK CHAT ROOM
        this.element = document.createElement("div");
        this.element.classList.add("Chat");
        this.element.innerHTML = (`
            <div class="head">
                <button class="btn-4 back">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="nama">
                    <img data-foto="${this.uid}" width="25" height="25" />
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
        const foto = this.element.querySelector(`.head .nama [data-foto="${this.uid}"]`);
        // PISAHKAN NAMA MENGGUNAKAN innerText
        nama.innerText = this.nama;
        foto.src = this.foto;
        // LISTENER TOMBOL BACK
        this.element.querySelector(".head .back").onclick = () => this.back();
        // LISTENER NAMA DIKLIK
        this.element.querySelector(".head .nama").onclick = () => new Pengguna(this.uid).init(document.querySelector(".container"));
        this.element.querySelector(".head .report").onclick = () => Notipin.Prompt({
            msg: "DESKRIPSIKAN HAL MENARIK (BUG/HAL KURANG BAIK) YANG KAMU TEMUKAN",
            max: 500,
            textarea: true,
            mode: "dark",
            onYes: (res) => new Dashboard().report(res)
        });
    }

    scroll() {
        this.element.querySelector(".content").scrollTop = this.element.querySelector(".content").scrollHeight;
    }

    onChat() {
        this.temanId = this.uid;
        // BIKIN DATA ROOM CHAT BARU
        this.temanList = {
            temanId: this.uid,
            sayaId: auth.currentUser.uid
        }
        // PATH KE ROOM CHAT
        const dbRef = firebase.database().ref("teman");
        // DAPATKAN INFORMASI APAKAH SUDAH ADA ROOM ATAU BELUM
        // ANGGAP SAJA SEMUA MASIH BELUM ADA
        this.flag = false;
        dbRef.once("value", (temans) => {
            temans.forEach((data) => {
                const snap = data.val();
            /*  DETEKSI APAKAH DATA
                DIA SAMA DENGAN DIA - DAN - KITA SAMA DENGAN KITA
                >> ATAU <<
                DIA SAMA DENGAN KITA - DAN - KITA SAMA DENGAN DIA */
                if ((snap.temanId == this.temanList.temanId && snap.sayaId == this.temanList.sayaId) || ((snap.temanId == this.temanList.sayaId && snap.sayaId == this.temanList.temanId))) {
                   // JIKA SALAH SATU DARI KEDUANYA BENAR, MAKA ROOM SUDAH ADA
                   this.flag = true;
                   // DAPATKAN KEY DARI ROOM TERSEBUT
                   this.chatKey = data.key;
                }
            });
            // JIKA TIDAK ADA
            if (this.flag === false) {
                // MAKA LETAKKAN ROOM CHAT BARU
                this.chatKey = firebase.database().ref("teman").push(this.temanList, error => {
                    // TAMPILKAN PESAN JIKA ADA ERROR
                    if (error) alert(error);
                    else {
                        // JIKA SUDAH, MAKA LOAD CHATNYA
                        this.loadChat();
                    }
                }).getKey();
            } else {
                // JIKA ADA, LANGSUNG LOAD CHATNYA
                this.loadChat();
            }
        })
    }

    loadChat() {
        // AMBIL CHAT-CHAT TERSEBUT DARI KEY YANG SUDAH DIAMBIL DARI ROOM TADI
        this.refresh = rdb.ref("chat/" + this.chatKey)
        // URUTKAN CHAT BERDASARKAN KEYNYA
        this.refresh.limitToLast(50).on("value", (chat) => {
            // KOSONGI TERLEBIH DAHULU CONTENTNYA
            this.element.querySelector(".content").innerHTML = '';
            chat.forEach((data) => {
                const snap = data.val();
                if (snap.uid == auth.currentUser.uid) {
                    // JIKA PENGIRIMNYA ADALAH KITA, MAKA TAMBAHKAN CLASS "KITA" DENGAN ALIGN DI KANAN
                    this.list = document.createElement("div");
                    this.list.classList.add("untai", "kita");
                    this.list.setAttribute("data-uid", data.key);
                    this.list.innerHTML = (`
                         <div class="untaian">
                            <div class="atas">
                                <button type="button" class="del" data-del="${data.key}">
                                    <i class="fas fa-trash-can"></i>
                                </button>
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
                    if(snap.pesan.indexOf("/gambarCP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `<img src="${snap.pesan}"/>`;
                    } else if(snap.pesan.indexOf("/suaraCP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `
                        <audio controls controlsList="nodownload"><source src="${snap.pesan}" type="audio/ogg"></audio>
                        `;
                    } else if(snap.pesan.indexOf("F?4?@)]CmKb?-{H_R") !== -1) {
                        this.list.querySelector(".atas .del").removeAttribute(`data-del`);
                        this.list.querySelector(".atas .del i").remove();
                        this.list.querySelector(".pesan").innerHTML = `<i class="error">${this.selang.chat.pesanTerhapus}</i>`;
                    } else {
                        // innerText PESANNYA
                        this.list.querySelector(".pesan").innerText = snap.pesan;
                    }

                    if(this.list.querySelector(`.atas [data-del="${data.key}"]`)) {
                        // this.list.querySelector(`.atas [data-del="${data.key}"]`).onclick = () => this.tarikChat(data.key, this.chatKey);
                        this.list.querySelector(`.atas [data-del="${data.key}"]`).onclick = () => {
                            Notipin.Confirm({
                                msg: this.selang.chat.notipinTarik,
                                yes: "YOI DONG",
                                no: "GA JADI",
                                onYes: () => this.tarikChat(data.key, this.chatKey),
                                mode: "dark",
                                type: "danger"
                            })
                        }
                    }
                } else {
                    // JIKA PENGIRIMNYA ADALAH ORANG LAIN, MAKA TAMBAH CLASS "MEREKA" DENGAN ALIGN DI KIRI
                    this.list = document.createElement("div");
                    this.list.classList.add("untai", "mereka");
                    this.list.setAttribute("data-uid", data.key);
                    this.list.innerHTML = (`
                    <div class="untaian">
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
                    if(snap.pesan.indexOf("/gambarCP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `<img src="${snap.pesan}"/>`;
                    } else if(snap.pesan.indexOf("/suaraCP") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `
                        <audio controls controlsList="nodownload"><source src="${snap.pesan}" type="audio/ogg"></audio>
                        `;
                    } else if(snap.pesan.indexOf("F?4?@)]CmKb?-{H_R") !== -1) {
                        this.list.querySelector(".pesan").innerHTML = `<i class="error">${this.selang.chat.pesanTerhapus}</i>`;
                    } else {
                        // innerText PESANNYA
                        this.list.querySelector(".pesan").innerText = snap.pesan;
                    }
                }
                // TAMPILKAN CHATNYA DI CONTENT
                this.element.querySelector(".content").appendChild(this.list);
            })
            this.scroll();
        })
    }

    tarikChat(untaikey, chatkey) {
        // BACA KEY UNTAIAN TERSEBUT
        rdb.ref("chat/" + chatkey + "/" + untaikey).once("value", (data) => {
            if(data.val().pesan.indexOf("/gambarCP") !== -1 || data.val().pesan.indexOf("/suaraCP") !== -1) {
                // JIKA MERUPAKAN GAMBAR/SUARA, MAKA HAPUS DULU DARI STORAGE
                stg.ref(data.val().path).delete().then(() => {
                    // DAN GANTI PESANNYA MENJADI KODE PESAN TERHAPUS
                    rdb.ref("chat/" + chatkey + "/" + untaikey).update({
                        pesan: "F?4?@)]CmKb?-{H_R"
                    });
                    // HAPUS JUGA PATHNYA DARI FOLDER KEY UNTAIANNYA
                    rdb.ref("chat/" + chatkey + "/" + untaikey + "/path").remove();
                }).catch(err => console.log(err));
            } else { // KALO BUKAN GAMBAR/SUARA
                // CUKUP GANTI MENJADI KODE PESAN TERHAPUS
                rdb.ref("chat/" + chatkey + "/" + untaikey).update({
                    pesan: "F?4?@)]CmKb?-{H_R"
                });
            }
        });
    }

    deteksiKirim() {
        const input = this.element.querySelector(`.foot .inputan [data-input="${auth.currentUser.uid}"]`);
        // AUTO FOCUS DI INPUT CHAT
        input.focus();
        const tombol = this.element.querySelector(`.foot .tombolan[data-button="${auth.currentUser.uid}"]`);
        // KEYDOWN LISTENER UNTUK INPUT CHAT
        input.onkeydown = () => {
            if (input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") {
                // JIKA KOSONG/WHITESPACE, MAKA TETAP TOMBOL MICROPHONE
                this.send = false;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                    </button>
                `);
            } else {
                // JIKA TIDAK KOSONG, GANTI MICROPHONE DENGAN SEND
                this.send = true;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-angles-right"></i>
                    </button>
                `);
            }
        }
        // KEYUP LISTENER UNTUK INPUT CHAT
        input.onkeyup = () => {
            if (input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") {
                // JIKA KOSONG/WHITESPACE, MAKA TETAP TOMBOL MICROPHONE
                this.send = false;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                    </button>
                `);
            } else {
                // JIKA TIDAK KOSONG, GANTI MICROPHONE DENGAN SEND
                this.send = true;
                tombol.innerHTML = (`
                    <button class="btn-2" data-klik="voice">
                        <i class="fa-solid fa-angles-right"></i>
                    </button>
                `);
            }
        }
        input.onkeypress = (e) => {
            // KETIKA MENEKAN TOMBOL ENTER
            if(e.keyCode == 13) {
                // JIKA VALUE KOSONG/WHITESPACE
                if(input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") return;
                // JIKA ADA ISINYA MAKA PERINTAHKAN UNTUK MENEKAN TOMBOL SEND
                this.send = true;
                tombol.click();
            }
        }
        // LISTENER TOMBOL SEND KETIKA DIKLIK
        tombol.onclick = () => {
            if(this.send === true) {
                // JALANKAN kirimChat
                this.kirimChat(input.value.replace(/^\s+/g, ''));
                // KOSONGKAN VALUE INPUT CHAT
                input.value = "";
                // FOKUSKAN KEMBALI KE INPUT CHAT
                input.focus();
                // GANTI TOMBOL SEND MENJADI MICROPHONE
                tombol.innerHTML = (`
                <button class="btn-2" data-klik="voice">
                    <i class="fa-solid fa-microphone-lines" data-mic="${auth.currentUser.uid}"></i>
                </button>
                `);
                this.send = false;
            } else {
                this.kirimVN(this.chatKey);
            }
        }

        // LISTENER FOTO DIKLIK
        const image = this.element.querySelector(`.foot .inputan [data-image="${auth.currentUser.uid}"]`);
        image.onclick = () => this.kirimFoto();

    }
    back() {
        // HAPUS DIV BARU
        this.element.remove();
        // BUKA LIST PESAN KEMBALI
        new ListPesan().init(document.querySelector(".container"));
        // MATIKAN USER REFRESH
        rdb.ref("chat/" + this.chatKey).off();
    }

    kirimFoto() {
        // BIKIN ELEMENT INPUT
        this.inputFoto = document.createElement("input");
        // TIPE INPUTANNYA ADALAH FILE
        this.inputFoto.setAttribute("type", "file");
        this.inputFoto.setAttribute("data-picture", auth.currentUser.uid);
        // FILE YANG DITERIMA ADALAH TIPE GAMBAR
        this.inputFoto.setAttribute("accept", "image/*");
        // PAKSA USER UNTUK OTOMATIS KLIK ELEMENT INPUT
        this.inputFoto.click();
        // CHANGE LISTENER KETIKA BERHASIL MEMILIH FOTO
        this.inputFoto.onchange = () => this.submitFoto(this.chatKey);
    }

    submitFoto(chatkey) { // SAMA KAYA GLOBAL
        const file = this.inputFoto.files[0];
        if (!file.type.match('image/*')) return Notipin.Alert({mode: "dark", msg: this.selang.chat.notipinTipeGambar});

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

        const fotoRef = stg.ref(`gambarCP/${auth.currentUser.uid}/${file.name}`);
        const fotoUp = fotoRef.put(file);

        fotoUp.on("state_changed", () => {}, err => {
            alert(err);
        }, () => {
            fotoUp.snapshot.ref.getDownloadURL().then(imgURL => {
                rdb.ref("chat/" + chatkey).child(new Date().getTime()).set({
                    uid: auth.currentUser.uid,
                    tanggal: tgl,
                    jam: jam,
                    pesan: imgURL,
                    path: `gambarCP/${auth.currentUser.uid}/${file.name}`,
                });
            }).then(() => {
                uploading.remove();
            })
        })

        this.inputFoto.remove();
    }

    kirimChat(msg) { // SAMA SEPERTI GLOBAL
        rdb.ref("chat/" + this.chatKey).child(new Date().getTime()).set({
            uid: auth.currentUser.uid,
            tanggal: tgl,
            jam: jam,
            pesan: msg
        });
    }

    kirimVN(chatkey) { // SAMA SEPERTI GLOBAL

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

                        const storageRef = stg.ref(`suaraCP/${auth.currentUser.uid}/${tgl}.opus`);
                        const task = storageRef.put(e.data)

                        task.on('state_changed', function (snap) {}, function (error) {
                            console.log(error.message)
                        }, function () {
                            task.snapshot.ref.getDownloadURL().then(audioUrl => {
                                rdb.ref("chat/" + chatkey).child(new Date().getTime()).set({
                                    uid: auth.currentUser.uid,
                                    tanggal: tgl,
                                    jam: jam,
                                    pesan: audioUrl,
                                    path: `suaraCP/${auth.currentUser.uid}/${tgl}.opus`,
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

    state() {
        // PUSH KE USERSTATE
        userState.changeLast("chat");
        userState.changeUID(this.uid);
        userState.changeNama(this.nama);
        userState.changeFoto(this.foto);
        // SIMPAN KE LOCALSTORAGE
        new Activity().save();
    }

    init(container) {
        // BERSIHKAN SEMUA
        new Landing().end();
        // BIKIN DIV UNTUK CHAT
        this.createElement();
        // MASUKKAN DIV KE CONTAINER
        container.appendChild(this.element);
        // DETEKSI ROOM CHAT
        this.onChat();
        // DETEKSI KEYDOWN/KEYUP
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