class Profil {
    constructor(uid) {
        // AMBIL DARI DASHBOARD
        this.selang = window.Bahasa[userState.last_lang];
        this.uid = uid;
    }

    createElement() {
        // BIKIN DIV BARU DENGAN CLASS PROFIL
        this.element = document.createElement("div");
        this.element.classList.add("Profil");
        this.element.innerHTML = (`
            <div class="tentang">
                <select class="status">
                    <option class="default">Loading</option>
                    <option value="online">Online</option>
                    <option value="idle">Idle</option>
                    <option value="busy">Busy</option>
                    <option value="offline ">Offline</option>
                </select>
                <div class="foto">
                    <i class="fal fa-edit edit-foto"></i>
                </div>
                <div class="nama">
                    Loading
                    <i class="fal fa-edit"></i>
                </div>
                <div class="bio">
                    <q>Loading</q>
                    <i class="fal fa-edit"></i>
                </div>
                <div class="follower">
                    <div class="pengikut">
                    Loading
                    </div>
                </div>
                <div class="email">Loading</div>
                <button class="btn-1 done hijau"><i class="fa-duotone fa-circle-check"></i> ${this.selang.profil.tombolSelesai}</button>
            </div>
        `);
        // AMBIL DATA USER
        this.getUserData();
        // CLICK LISTENER TOMBOL DONE UNTUK KELUAR DARI PROFIL
        this.element.querySelector(".done").onclick = () => {
            new ListPesan().init(document.querySelector(".container"));
            this.end();
        }
    }

    getUserData() {
        rdb.ref("users").child(this.uid).once('value', (snap) => {
            // AMBIL VALUE DARI FIREBASE DATABASE
            const resDname = snap.val().displayName;
            const photo = snap.val().photo;
            const email = snap.val().email;
            const resNama = snap.val().nama;
            const bio = snap.val().bio;
            const status = snap.val().status;
            const foto = snap.val().foto;
            // ELEMENT UNTUK MELETAKKAN RINCIAN AKUN 
            this.elNama = this.element.querySelector(".tentang .nama");
            this.elBio = this.element.querySelector(".tentang .bio");
            this.elEmail = this.element.querySelector(".tentang .email");
            this.elStatus = this.element.querySelector(".tentang .status .default");
            this.elFoto = this.element.querySelector(".tentang .foto");
            this.elFoto.style.backgroundImage = `url("${foto?foto:photo}")`;
            // GANTI VALUE APABILA UNDEFINED
            this.elNama.innerText = resNama ? `@${resNama}` : resDname;
            this.elBio.innerText = bio ? `“${bio}”\n` : "Tambahkan Bio";
            this.elEmail.innerText = email;
            this.elStatus.innerText = status ? status : "Online";
            // TOMBOL UNTUK EDIT
            this.editNama = document.createElement("i");
            this.editNama.classList.add("fal", "fa-edit");
            this.editBio = document.createElement("i");
            this.editBio.classList.add("fal", "fa-edit");
            // LETAKKAN EDIT SETELAH ELEMENT HASIL 
            this.elNama.appendChild(this.editNama);
            this.elBio.appendChild(this.editBio);
            // CLICK LISTENER UNTUK TOMBOL EDIT
            this.editNama.onclick = () => this.ngeditNama();
            this.editBio.onclick = () => this.ngeditBio();
            // CHANGE LISTENER PADA GANTI STATUS
            this.element.querySelector(".tentang .status").onchange = () => this.ngeditStatus();
            // CLICK LISTENER UNTUK EDIT FOTO
            this.elFoto.onclick = () => this.ngeditFoto();
        })
        // BACA FOLDER FOLLOWRE
        rdb.ref("users/" + this.uid + "/follower").once("value", data => {
            if(data.exists()) { // KALO DI DALAMNYA TERDAPAT KEY
                // TAMPILKAN JUMLAH KEYNYA
                this.element.querySelector(".pengikut").innerHTML = `${this.selang.profil.pengikut}:${data.numChildren()}`;
            } else { // KALO GADA
                // TAMPILKAN STRING 0
                this.element.querySelector(".pengikut").innerHTML = `${this.selang.profil.pengikut}:0`;
            }
        })
    }

    ngeditFoto() {
        // BIKIN ELEMENT INPUT
        this.inputFoto = document.createElement("input");
        // TIPE INPUTANNYA ADALAH FILE
        this.inputFoto.setAttribute("type", "file");
        // FILE YANG DITERIMA ADALAH TIPE GAMBAR
        this.inputFoto.setAttribute("accept", "image/*");
        // PAKSA USER UNTUK OTOMATIS KLIK ELEMENT INPUT
        this.inputFoto.click();
        // CHANGE LISTNERE KETIKA BERHASIL MEMILIH FOTO
        this.inputFoto.onchange = () => this.submitFoto();
    }

    submitFoto() {
        // AMBIL FILE YANG DIPILIH USER
        const file = this.inputFoto.files[0];
        // KASIH PESAN JIKA USER TIDAK MEMILIH FOTO
        if (!file.type.match('image/*')) return Notipin.Alert({mode:"dark", msg: `${this.selang.profil.notipinTipeGambar}`});
        // PATH KE FOLDER FIREBASE STORAGE DAN LETAKKAN FILENYA
        const fotoRef = stg.ref(`users/${auth.currentUser.uid}/profil.jpg`);
        const fotoUp = fotoRef.put(file);
        
        const loader = document.createElement("div");
        loader.classList.add("loading");
        loader.innerHTML = (`<i class="fa-duotone fa-spinner"></i>`);
        this.element.querySelector(".foto").prepend(loader);
        // PROSES MENUNGGAH FILE
        fotoUp.on("state_changed", () => {}, err => {
            // TAMPILKAN PESAN JIKA ADA ERROR
            alert(err);
        }, () => {
            // LETAKKAN PATH DI DATABASE JIKA SUDAH TERUNGGAH
            fotoUp.snapshot.ref.getDownloadURL().then(imgURL => {
                rdb.ref('users').child(auth.currentUser.uid).update({
                    "foto": imgURL
                });
            }).then(() => {
                // REFRESH PROFIL USER
                this.getUserData();
                // HAPUS ELEMENTNYA
                this.inputFoto.remove();
                loader.remove();
                return;
            })
        })

    }

    ngeditStatus() {
        const selection = this.element.querySelector(".tentang .status");
        // PUSH OPSI KE DATABASE
        rdb.ref("users").child(this.uid).update({
            status: selection.value
        });
        // REFRESH PROFIL USER
        this.getUserData();
    }

    ngeditNama() {
        // KOSONGI NAMA USER
        this.element.querySelector(".tentang .nama").innerHTML = '';
        // FORM ELEMENT UNTUK USER ISI
        this.namaEditEl = document.createElement("div");
        this.namaEditEl.classList.add("Ganti");
        this.namaEditEl.innerHTML = (`
            <input type="text" placeholder="${this.selang.profil.inputUsername}" class="tulis" />
            <div class="tombol">
                <button class="cancel btn-1">${this.selang.profil.tombolBatal}</button>
                <button class="save btn-1">${this.selang.profil.tombolSimpan}</button>
            </div>
        `);
        // MASUKIN FORM USER
        this.element.querySelector(".tentang .nama").prepend(this.namaEditEl);
        // JALANKAN ULANG PROFIL JIKA DIBATALKAN
        this.namaEditEl.querySelector(".cancel").onclick = () => {
            this.end();
            this.init(document.querySelector(".container"));
        }

        this.namaEditEl.querySelector(".tulis").onkeypress = (e) => {
            // KETIKA MENEKAN TOMBOL ENTER
            if(e.keyCode == 13) {
                this.namaEditEl.querySelector(".save").click();
            }
        }

        // LANJUTKAN JIKA USER MEMILIH SAVE
        this.namaEditEl.querySelector(".save").onclick = () => this.submitNama();
        // AUTOFOCUS DI INPUT
        this.namaEditEl.querySelector(".tulis").focus();
    }

    submitNama() {
        const tulisNama = this.namaEditEl.querySelector(".tulis");
        if (tulisNama.value.replace(/^\s+/g, '').length < 1) {
            // APABILA KOSONG, BATALKAN DAN JALANKAN ULANG PROFIL
            this.end();
            this.init(document.querySelector(".container"));
        } else if (tulisNama.value.replace(/^\s+/g, '').length < 4) {
            // APABILA KURANG DARI 4 KARAKTER, TAMPILKAN PEMBERITAHUAN
            Notipin.Alert({
                mode:"dark", 
                msg: `${this.selang.profil.notipinUsername}`,
            })
        } else {
            // APABILA SUDAH BENAR, PUSH KE DATABASE
            rdb.ref("users").child(this.uid).update({
                nama: tulisNama.value.replace(/\s/g, '').toLowerCase()
            });
            // REFRESH PROFIL
            this.getUserData();
        }
    }

    ngeditBio() {
        // SAMA SEPERTI NAMA
        this.element.querySelector(".tentang .bio").innerHTML = '';
        this.bioEditEl = document.createElement("div");
        this.bioEditEl.classList.add("Ganti");
        this.bioEditEl.innerHTML = (`
            <input type="text" placeholder="${this.selang.profil.inputBio}" maxlength="100" class="tulis" />
            <div class="tombol">
                <button class="cancel btn-1">${this.selang.profil.tombolBatal}</button>
                <button class="save btn-1">${this.selang.profil.tombolSimpan}</button>
            </div>
        `);
        this.element.querySelector(".tentang .bio").prepend(this.bioEditEl);
        this.bioEditEl.querySelector(".cancel").onclick = () => {
            this.end();
            this.init(document.querySelector(".container"));
        }
        
        this.bioEditEl.querySelector(".tulis").onkeypress = (e) => {
            // KETIKA MENEKAN TOMBOL ENTER
            if(e.keyCode == 13) {
                this.bioEditEl.querySelector(".save").click();
            }
        }

        this.bioEditEl.querySelector(".save").onclick = () => this.submitBio();
        this.bioEditEl.querySelector(".tulis").focus();
    }

    submitBio() {
        // SAMA SEPERTI NAMA
        const tulisBio = this.bioEditEl.querySelector(".tulis");
        if (tulisBio.value.replace(/^\s+/g, '').length < 1) {
            this.end();
            this.init(document.querySelector(".container"));
        } else {
            rdb.ref("users").child(this.uid).update({
                bio: tulisBio.value.replace(/^\s+/g, '')
            });
            this.getUserData();
        }

    }

    state() {
        // PUSH KE USERSTATE
        userState.changeLast("profil");
        // SIMPAN KE LOCALSTORAGE
        new Activity().save();
    }

    end() {
        // HAPUS ELEMENT PROFIL
        this.element.remove();
    }

    init(container) {
        this.state();
        // BERSIHKAN SEMUA
        new Landing().end();
        // BIKIN ELEMENT PROFIL
        this.createElement();
        // MASUKKAN ELEMENT KE CONTAINER
        container.appendChild(this.element);
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/