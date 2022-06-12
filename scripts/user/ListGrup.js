class ListGrup {
    createElement() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        // BIKIN DIV BARU (COPAS DARI LIST CHAT)
        this.element = document.createElement("div"); 
        this.element.classList.add("ListChat");
        // LANGSUNG JALANKAN KEDUANYA
        this.getGrup();
        this.joinCreate();
    }

    getGrup() { // AGAK RIBET TAPI SEMOGA PAHAM
        // BACA LIST GUILD DI FOLDER USER SENDIRI
        rdb.ref("users/"+ auth.currentUser.uid).child("grup").once("value", (akun) => {
            rdb.ref("grup").once("value", (guild) => { // BACA JUGA FOLDER GRUPNYA
                if(akun.exists() && guild.exists()) { // KALO FOLDER GRUP ADA ISINYA
                    akun.forEach(akunData => { // BACA SETIAP GUILD YANG ADA DI FOLDER USER
                        guild.forEach(grupData => {  // BACA JUGA SETIAP FOLDER GRUP YANG ADA
                            rdb.ref("grup/"+grupData.key+"/members/").once("value", count => { // LIHAT KE FOLDER MEMBERNYA
                            const snap = grupData.val();
                            if(akunData.key === grupData.key) { // KALO DATA DI FOLDER USER COCOK DENGAN DI FOLDER GRUP
                                // BIKIN DIV BARU KARTU GRUP
                                this.list = document.createElement("div");
                                this.list.classList.add("kartu");
                                this.list.setAttribute("data-uid", grupData.key);
                                this.list.innerHTML = (`
                                    <div class="detail">
                                        <img width="35" height="35" src="${snap.foto?snap.foto:'./images/defaultGrup.png'}" />
                                        <div class="nama">
                                            ${snap.nama}
                                        </div>
                                    </div>
                                    <div class="status"></div>
                                `);
                                let anggota = count.numChildren(); // JUMLAH KEY DI FOLDER MEMBER
                                this.list.querySelector(".status").innerHTML = anggota+" Anggota"; // MASUKIN KE STATUS DI LIST DIV
                                // LISTENER KALO DIKLIK (DAN IF ELSE UNTUK FOTO PROFIL GRUP)
                                this.list.onclick = () => this.openGrup(grupData.key, snap.nama, snap.foto?snap.foto:'./images/defaultGrup.png', anggota, snap.owner);
                            } else {
                                return; // KALO UDAH GADA COCOK, STOP SCRIPTNYA
                            }
                            this.element.prepend(this.list); // MASUKIN DIV KARTU GRUP KE LIST GRUP
                        })
                    })
                    })
                } else {
                    return; // KALO GADA GRUP SAMA SEKALI, STOP SCRIPTNYA
                }
            })
        })
        this.habis(); // TAMPILKAN SETELAH GRUP TERAKHIR
    }

    openGrup(uid, nama, foto, member, owner) {
        this.close(); // TUTUP LIST GRUP
        // BUKA CHAT ROOM GRUP TERSEBUT
        new Grup({uid, nama, foto, member, owner}).init(document.querySelector(".container"));
    }

    habis() {
        // TAMPILAN SETELAH KARTU LIST GRUP TERAKHIR
        this.noMore = document.createElement("div");
        this.noMore.classList.add("nomore");
        this.noMore.innerHTML = this.selang.list_grup.nomore;
        this.element.appendChild(this.noMore);
    }

    joinCreate() {
        // DIV UNTUK BERGABUNG/BUAT GRUP
        this.joinElement = document.createElement("div");
        this.joinElement.classList.add("tombol");
        this.joinElement.innerHTML = (`
            <button class="btn-1 biru create"><i class="fa-light fa-square-plus"></i> ${this.selang.list_grup.tombolBuat}</button>
            <button class="btn-1 biru join"><i class="fa-light fa-arrow-right-to-bracket"></i> ${this.selang.list_grup.tombolGabung}</button>
        `);
        this.element.appendChild(this.joinElement);
        // LISTENER 2 TOMBOL
        this.joinElement.querySelector(".create").onclick = () => this.openCreate();
        this.joinElement.querySelector(".join").onclick = () => this.openJoin();

    }

    openCreate() {
        // BIKIN FORM UNTUK PEMBUATAN GRUP
        this.createGrup = document.createElement("div");
        this.createGrup.classList.add("createGrup");
        this.createGrup.innerHTML = (`
            <div class="title">${this.selang.list_grup.judulBuat}</div>
            <div class="inputan">
                <input data-grup="${auth.currentUser.uid}" type="text" placeholder="${this.selang.list_grup.inputNama}" maxlength="20" />
            </div>
            <div class="tombolan">
                <button class="btn-1 merah cancel"><i class="fa-duotone fa-circle-x"></i> ${this.selang.list_grup.tombolBatal}</button>
                <button class="btn-1 hijau done"><i class="fa-duotone fa-circle-check"></i> ${this.selang.list_grup.tombolLanjut_Buat}</button>
            </div>
        `);
        // MASUKIN FORM KE LIST GRUP (Z-INDEX 1 - MENIMPA HASIL LIST GRUP)
        this.element.appendChild(this.createGrup);
        this.buatGrup(); // JALANKAN buatGrup
        // LISTENER TOMBOL BATAL, HAPUS FORM
        this.createGrup.querySelector(".cancel").onclick = () => this.createGrup.remove();
    }

    buatGrup() { // PEMBUATAN GRUP
        const input = this.createGrup.querySelector(`.inputan [data-grup="${auth.currentUser.uid}"]`);
        input.focus(); // FOKUSIN KE TEXT INPUT
        input.onkeypress = (e) => {
            if(e.keyCode == 13) { // KEY ENTER = KLIK SUBMIT
                submit.click();
            }
        }
        const submit = this.createGrup.querySelector(".tombolan .done");

        submit.onclick = () => { // LISTENER SUBMIT DIKLIK
            const hasil = input.value.replace(/^\s+/g, ''); // HAPUS SEMUA WHITESPACE
            if(hasil < 1) return; // KALO KURANG DARI 1 KARAKTER MAKA STOP SCRIPTNYA
            const chara = "krm" + new Date().getTime(); // BIKIN ID GRUPNYA (KEY GUILD)
            this.submitGrup(hasil, chara); // JALANKAN submitGrup()
        }
    }

    submitGrup(name, uid) {
        // TAMBAHKAN OTOMATIS KEY GUILD KE FOLDER USER OWNERNYA
        rdb.ref("users/"+auth.currentUser.uid+"/grup").child(uid).set({
            nama: name,
            uid: uid
        });
        // BIKIN FOLDER GRUPNYA
        rdb.ref("grup/" + uid).set({
            nama: name,
            owner: auth.currentUser.uid
        });
        // MASUKIN OTOMATIS OWNER MENJADI MEMBER GRUPNYA
        rdb.ref("grup/" + uid + "/members/" + auth.currentUser.uid).set({
            member: true,
        });
        // KEMBALIKAN KE LIST GRUP
        new ListGrup().init(document.querySelector(".container"));
    }

    openJoin() {
        // DIV BARU (COPAS DARI CREATE GRUP)
        this.joinGrup = document.createElement("div");
        this.joinGrup.classList.add("createGrup");
        this.joinGrup.innerHTML = (`
            <div class="title">${this.selang.list_grup.judulGabung}</div>
            <div class="error"></div>
            <div class="inputan">
                <input data-grup="${auth.currentUser.uid}" type="text" placeholder="${this.selang.list_grup.inputID}" maxlength="30" />
            </div>
            <div class="tombolan">
                <button class="btn-1 merah cancel"><i class="fa-duotone fa-circle-x"></i> ${this.selang.list_grup.tombolBatal}</button>
                <button class="btn-1 hijau done"><i class="fa-duotone fa-circle-check"></i> ${this.selang.list_grup.tombolLanjut_Gabung}</button>
            </div>
        `);
        // KURANG LEBIH SAMA DENGAN CREATE GRUP
        this.element.appendChild(this.joinGrup);
        const input = this.joinGrup.querySelector(`.inputan [data-grup="${auth.currentUser.uid}"]`);
        input.focus();
        input.onkeypress = (e) => {
            if(e.keyCode == 13) {
                this.joinGrup.querySelector(".done").click();
            }
        }
        this.joinGrup.querySelector(".cancel").onclick = () =>  this.joinGrup.remove();
        this.joinGrup.querySelector(".done").onclick = () => this.cariGrup();
    }

    cariGrup() {
        const errEl = this.joinGrup.querySelector(".error");
        errEl.innerHTML = ""; // << ELEMENT ERROR INI GA JADI DIPAKE, JADI ABAIKAN ATAU BOLEH HAPUS
        // VALUE DARI INPUTAN KITA
        const input = this.joinGrup.querySelector(`.inputan [data-grup="${auth.currentUser.uid}"]`);
        rdb.ref("grup").once("value", (guild) => { // BACA FOLDER GRUPNYA
            if(guild.exists()) { // KALO ADA KEY DI FOLDERNYA
                guild.forEach(data => { // BACA MASING-MASING KEY
                    if(input.value === data.key) { // KALO VALUE YANG KITA MASUKKIN SESUAI DENGAN SALAH SATU KEY GUILD
                        this.suksesJoinGrup(data.key, data.val().nama); // LANJUTKAN
                    } else { // KALO GA SESUAI
                        // MUNCULIN ALERT DAN STOP SCRIPTNYA
                        Notipin.Alert({msg: this.selang.list_grup.notipinGagal, mode: "dark"});
                    }
                })
            } else { // KALO GADA KEY SAMA SEKALI
                // MUNCULIN ALERT DAN STOP SCRIPTNYA
                Notipin.Alert({msg: this.selang.list_grup.notipinGagal, mode: "dark"});
            }
        })
    }

    suksesJoinGrup(uid, name) {
        // TAMBAHKAN KEY GUILD KE FOLDER USER
        rdb.ref("users/"+auth.currentUser.uid+"/grup").child(uid).set({
            nama: name
        });
        // TAMBAHKAN ID USER KE FOLDER MEMBER GRUP
        rdb.ref("grup/" + uid + "/members/" + auth.currentUser.uid).set({
            member: true,
        });
        // KEMBALIKAN KE LIST GRUP
        new ListGrup().init(document.querySelector(".container"));
    }

    state() {
        // GATI LAST ACTIVITY & SIMPAN PERUBAHAN
        userState.changeLast("listGrup");
        new Activity().save();
    }

    navbar(container) {
        // NYALAIN NAVBAR
        container.querySelector(".navbar .grup").classList.add("active");
    }

    close() {
        // HAPUS ELEMENT LIST GRUP
        if(this.element) {this.element.remove()};
    }

    init(container) {
        // OTOMATIS DIJALANKAN SETELAH DIPANGGIL
        new Landing().end();
        new Dashboard().createElement();
        this.navbar(container);
        this.state();
        this.createElement();
        container.appendChild(this.element);
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/