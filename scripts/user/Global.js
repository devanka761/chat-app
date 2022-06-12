class Global {
    constructor() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        this.send = false; // DEFAULT BOOLEAN ANTARA TOMBOL SEND / MICROPHONE
        this.chunks = []; // KASIH ARRAY KOSONG BIAR GA UNDEFINED
        this.recorder = undefined; // INI MEMANG DIBUAT UNDEFINED
    }
    createElement() { // BIKIN DIV BARU CHAT GLOBAL (COPAS DARI CHAT)
        this.element = document.createElement("div");
        this.element.classList.add("Chat");
        this.element.innerHTML = (`
            <div class="head">
                <button class="btn-4 back">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="nama">
                    <div data-nama="global">GLOBAL</div>
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
        // TOMBOL KEMABALI
        this.element.querySelector(".head .back").onclick = () => this.back();
        // PROMPT TOMBOL REPORT
        this.element.querySelector(".head .report").onclick = () => Notipin.Prompt({
            msg: "DESKRIPSIKAN HAL MENARIK (BUG/HAL KURANG BAIK) YANG KAMU TEMUKAN",
            max: 500,
            textarea: true,
            mode: "dark",
            onYes: (res) => new Dashboard().report(res)
        });
    }

    loadChat() {
        rdb.ref("global").limitToLast(50).on("value", (untaian) => { // FOLDER GLOBAL
            this.element.querySelector(".content").innerHTML = '';
            if(untaian.exists()) { // KALO FOLDER GLOBAL ADA ISINYA
                untaian.forEach((data) => { // MASING-MASING KEY DI DALAM FOLDER GLOBAL
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
                        if(snap.pesan.indexOf("/gambarGL") !== -1) { // KALO PESANNYA MERUPAKAN LINK GAMBAR
                            this.list.querySelector(".pesan").innerHTML = `<img src="${snap.pesan}"/>`;
                        } else if(snap.pesan.indexOf("/suaraGL") !== -1) { // KALO PESANNYA MERUPAKAN LINK AUDIO
                            this.list.querySelector(".pesan").innerHTML = `
                            <audio controls controlsList="nodownload"><source src="${snap.pesan}" type="audio/ogg"></audio>
                            `;
                        } else if(snap.pesan.indexOf("F?4?@)]CmKb?-{H_R") !== -1) { // KALO PESANNYA MERUPAKAN KODE (RANDOM BUAT PESAN DITARIK)
                            this.list.querySelector(".atas .del").removeAttribute(`data-del`);
                            this.list.querySelector(".atas .del i").remove();
                            this.list.querySelector(".pesan").innerHTML = `<i class="error">${this.selang.chat.pesanTerhapus}</i>`;
                        } else { // KALO PESANNYA NORMAL
                            // innerText PESANNYA
                            this.list.querySelector(".pesan").innerText = snap.pesan;
                        }

                        if(this.list.querySelector(`.atas [data-del="${data.key}"]`)) { // KALO TOMBOL HAPUSNYA ADA
                            // MAKA MUNCULKAN KONFIRMASI TARIK PESAN
                            this.list.querySelector(`.atas [data-del="${data.key}"]`).onclick = () => Notipin.Confirm({
                                msg: this.selang.chat.notipinTarik,
                                onYes: () => this.tarikChat(data.key), // KASIH PARAMETER KEY DARI UNTAIANNYA
                                mode: "dark",
                                type: "danger"
                            })
                        }
                    } else {
                        // JIKA PENGIRIMNYA ADALAH ORANG LAIN, MAKA TAMBAH CLASS "MEREKA" DENGAN ALIGN DI KIRI
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

                        // SAMA SEPERTI DI ATAS
                        const namaEl = this.list.querySelector(`.untaian .nick[data-nama="${data.key}"]`);
                        this.getName(namaEl, snap.uid); // KASIH PARAMETER BUAT MUNCULIN NAMA
                        if(snap.pesan.indexOf("/gambarGL") !== -1) {
                            this.list.querySelector(".pesan").innerHTML = `<img src="${snap.pesan}"/>`;
                        } else if(snap.pesan.indexOf("/suaraGL") !== -1) {
                            this.list.querySelector(".pesan").innerHTML = `
                            <audio controls controlsList="nodownload"><source src="${snap.pesan}" type="audio/ogg"></audio>
                            `;
                        } else if(snap.pesan.indexOf("F?4?@)]CmKb?-{H_R") !== -1) {
                            this.list.querySelector(".pesan").innerHTML = `<i class="error">${this.selang.chat.pesanTerhapus}/i>`;
                        } else {
                            this.list.querySelector(".pesan").innerText = snap.pesan;
                        }
                    }
                    this.element.querySelector(".content").appendChild(this.list);
                });
                this.scroll(); // JALANIN SCROLL();
            }
        })
    }

    tarikChat(untaikey) {
        rdb.ref("global/" + untaikey).once("value", (data) => { // FOLDER KEY UNTAIAN YANG DIHAPUS
            if(data.val().pesan.indexOf("/gambarGL") !== -1 || data.val().pesan.indexOf("/suaraGL") !== -1) {
                // KALO PESANNYA MERUPAKAN GAMBAR/AUDIO, MAKA HAPUS DULU FILE DI STORAGE FIREBASENYA
                stg.ref(data.val().path).delete().then(() => {
                    // TERUS GANTI ISI PESANNYA MENJADI KODE TARIK PESAN
                    rdb.ref("global/" + untaikey).update({
                        pesan: "F?4?@)]CmKb?-{H_R"
                    });
                    // DAN HAPUS PATH YANG ADA DI KEYNYA
                    rdb.ref("global/" + untaikey+"/path").remove();
                }).catch(err => console.log(err));
            } else {
                // KALO BUKAN GAMBAR/AUDIO, MAKA LANGSUNG GANTI MENJADI KODE TARIK PESAN
                rdb.ref("global/" + untaikey).update({
                    pesan: "F?4?@)]CmKb?-{H_R"
                });
            }
        })
    }
    
    getName(element, uid) {
        // FOLDER USER
        rdb.ref("users/" + uid).once("value", (data) => { // SESUAI UID
            const nama = data.val().nama?data.val().nama:data.val().displayName; // IF ELSE
            element.innerText = nama; // MUNCULIN NAMANYA
            // KALO NAMANYA DIKLIK, SAMA DENGAN MEMBUKA PROFIL USER TERSEBUT
            element.onclick = () => new Pengguna(uid).init(document.querySelector(".container"));
        })
    }

    back() {
        // TOMBOL KEMBALI = BUKA LIST PESAN
        new ListPesan().init(document.querySelector(".container"));
    }

    scroll() {
        // DAPATKAN UKURAN Y NYA, TERUS SCROLL SESUAI UKURANNYA
        this.element.querySelector(".content").scrollTop = this.element.querySelector(".content").scrollHeight;
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
                this.kirimVN();
            }
        }
        // LISTENER FOTO DIKLIK
        const image = this.element.querySelector(`.foot .inputan [data-image="${auth.currentUser.uid}"]`);
        image.onclick = () => this.kirimFoto();
    }
    kirimChat(msg) {
        // PUSH CHAT KE DATABASE
        rdb.ref("global").child(new Date().getTime()).set({
            uid: auth.currentUser.uid,
            tanggal: tgl,
            jam: jam,
            pesan: msg
        });
    }

    kirimVN() {
        // LOGO MICROPHONE
        const logoMic = this.element.querySelector(`.tombolan [data-mic="${auth.currentUser.uid}"]`);

        // USER MEDIA SEDERHANA
        let device = navigator.mediaDevices.getUserMedia({
            audio: true
        });
        device.then(stream => { // SETELAH MUNCUL MERAH-MERAH DI TABLIST
            if (this.recorder === undefined) { // PASTIKAN RECORDERNYA UNDEFINED (LIHAT CONSTRUCTOR)
                this.recorder = new MediaRecorder(stream);
                this.recorder.ondataavailable = e => {
                    // HASIL VOICE KITA
                    this.chunks.push(e.data);
                    if (this.recorder.state === 'inactive') {
                        // KALO UDAH INACTIVE, MAKA TAROH HASILNYA DI ARRAY YANG ADA DI CHUNKS (LIHAT CONSTRUCTOR)
                        let blob = new Blob(this.chunks, {
                            type: 'audio/webm' // TIPE FILE UMUM UNTUK AUDIO
                        });
                        const element = this.element;
                        const reader = new FileReader(); // FILE READER KURANG LEBIH SAMA CARA KERJA DENGAN BASE64
                        reader.addEventListener("load", function () {
                            // MUNCULIN DIV LOADING
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

                            // STORAGE FIREBASE
                            const storageRef = stg.ref(`suaraGL/${auth.currentUser.uid}/${tgl}.opus`);
                            // UPLOAD HASIL KE STORAGE
                            const task = storageRef.put(e.data)
                            task.on('state_changed', function (snap) {
                                // NIATNYA MAU DIKASIH PROGRESS BAR, TAPI MALESSSS
                            }, function (error) { // CATCH ERROR DI CONSOLE AJA
                                console.log(error.message);
                            }, function () {
                                // KALO UDAH SUKSES, CARI LINKNYA
                                task.snapshot.ref.getDownloadURL().then(audioUrl => {
                                    // PUSH KE CHAT
                                    rdb.ref("global").child(new Date().getTime()).set({
                                        uid: auth.currentUser.uid,
                                        tanggal: tgl,
                                        jam: jam,
                                        pesan: audioUrl, // MODEL PESANNYA ADALAH LINK AUDIONYA
                                        path: `suaraGL/${auth.currentUser.uid}/${tgl}.opus`,
                                    });
                                }).then(() => uploading.remove()); // HAPUS DIV LOADING
                            });
                        }, false);
                        reader.readAsDataURL(blob);
                    }
                }
                this.recorder.start(); // KALO UDAH MULAI MENERIMA DATA SUARA
                logoMic.setAttribute('class', 'fas fa-stop'); // GANTI MENJADI FA-STOP
            }
        });
        if (this.recorder !== undefined) { // KALO UNDEFINED
            if (logoMic.getAttribute('class').indexOf('stop') !== -1) { // DAN KALO LAGI TOMBOL STOP/LAGI MEREKAM
                this.recorder.stop(); // STOP REKAMANNYA
                logoMic.setAttribute('class', 'fa-solid fa-microphone-lines'); // GANTI MENJADI FA-MIC
            } else { // KALO LAGI TOMBOL MIC/GAK LAGI MEREKAM
                this.chunks = []; // KOSONGIN ARRAY CHUNKSNYA
                this.recorder.start(); // MULAI REKAMANNYA
                logoMic.setAttribute('class', 'fa-solid fa-stop'); // GANTI LAGI MENJADI FA-STOP
            }
        }
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

    submitFoto() {
        // AMBIL FILE YANG DIPILIH USER
        const file = this.inputFoto.files[0];
        // KASIH PESAN JIKA USER TIDAK MEMILIH FOTO
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

        // KURANG LEBIH SAMA DENGAN SUARA
        const fotoRef = stg.ref(`gambarGL/${auth.currentUser.uid}/${file.name}`);
        const fotoUp = fotoRef.put(file);

        fotoUp.on("state_changed", () => {}, err => {
            alert(err);
        }, () => {
            fotoUp.snapshot.ref.getDownloadURL().then(imgURL => {
                rdb.ref("global").child(new Date().getTime()).set({
                    uid: auth.currentUser.uid,
                    tanggal: tgl,
                    jam: jam,
                    pesan: imgURL,
                    path: `gambarGL/${auth.currentUser.uid}/${file.name}`,
                });
            }).then(() => {
                uploading.remove();
            })
        })

        this.inputFoto.remove();
    }

    state() {
        // SIMPAN PERUBAHAN LAST ACTIVITY
        userState.changeLast("global");
        new Activity().save();
    }

    /*
    ukuranLayar() {
        const width = window.innerWidth;
        if(width >= 950) {
            new Dashboard().createElement();
        }
    }
    */

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