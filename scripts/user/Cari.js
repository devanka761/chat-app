class Cari {
    constructor() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
    }
    async createElement() {
        // DIV BARU PENCARIAN (COPAS DARI LIST CHAT)
        this.element = document.createElement("div");
        this.element.classList.add("ListChat");

        // DIV BARU FORM PENCARIAN
        this.cariElement = await document.createElement("div");
        this.cariElement.classList.add("createGrup");
        this.cariElement.innerHTML = (`
        <div class="title">${this.selang.cari.judul}</div>
        <div class="error"></div>
        <div class="inputan">
            <input data-grup="${auth.currentUser.uid}" type="text" placeholder="${this.selang.cari.inputNama}" maxlength="20"/>
        </div>
        <div class="tombolan">
            <button class="btn-1 merah cancel"><i class="fa-duotone fa-circle-x"></i> ${this.selang.cari.tombolBatal}</button>
            <button class="btn-1 hijau done"><i class="fa-duotone fa-circle-check"></i> ${this.selang.cari.tombolLanjut}</button>
        </div>
        `);

        this.element.appendChild(this.cariElement); // MASUKKIN KE DALAM DIV PENCARIAN
        const cari = this.cariElement.querySelector(`.inputan [data-grup="${auth.currentUser.uid}"]`);
        cari.focus(); // OTOMATIS FOKUS
        cari.onkeypress = (e) => { // LISTENER KEYPRESS
            if(e.keyCode == 13) { // JIKA MENEKAN TOMBOL ENTER
                this.cariElement.querySelector(".tombolan .done").click(); // MAKA SAMA DENGAN KLIK TOMBOL POSITIF (HIJAU)
            }
        }
        // LISTENER TOMBOL NEGATIF (MERAH) DIKLIK
        this.cariElement.querySelector(".tombolan .cancel").onclick = () => new ListPesan().init(document.querySelector(".container"));
        // LISTENER TOMBOL POSITIF (HIJAU) DIKLIK
        this.cariElement.querySelector(".tombolan .done").onclick = () => this.pencarian();
    }
    pencarian() {
        const cari = this.element.querySelector(`.inputan [data-grup="${auth.currentUser.uid}"]`);
        const input = cari.value.replace(/^\s+/g, ''); // HASIL KETIKAN USER YANG SPASINYA DIHAPUS
        const erEl = this.element.querySelector(".error"); // AWALNYA MAU DIBUAT HASIL ERROR DI SINI
        erEl.innerHTML = ""; // DAN DITAROH DI SINI TAPI GA JADI -- DAN 2 BARIS INI TIDAK BERGUNA
        if(input.length < 2) { // KALO NGETIK KURANG DARI 2 KARAKTER
            // MUNCULIN ALERT
            Notipin.Alert({msg: this.selang.cari.notipinKarakter, mode: "dark"});
            cari.value = '';
            cari.focus();
            return; // STOP SCRIPTNYA
        } else { // KALO LEBIH DARI 2 KARAKTER
            this.temukan(input); // MAKA LANJUTIN DEH
        }
    }
    temukan(input) {
        rdb.ref("users").once("value", akun => { // FOLDER USERS
            akun.forEach(data => { // MASING-MASING USER
                const snap = data.val(); // BIAR GA KEPANJANGAN
                const nama = snap.nama?snap.nama:snap.displayName; // IF ELSE CONTOHNYA DI BAWAH INI:
                /*
                    snap.nama?snap.nama:snap.displayName
                    HAL TERSEBUT ADALAH VERSI SINGKAT DARI BERIKUT INI:

                    if (snap.nama) {               // JIKA snap.nama ITU ADA
                        return snap.nama          //  MAKA PAKE TUH snap.nama DAN STOP SCRIPTNYA
                    } else {                     //   TAPI JIKA snap.nama ITU GAADA ATAU ERROR, ATAU UNDEFINED, ATAU NULL
                        return snap.displayName //    MAKA PAKE snap.displayName DAN STOP SCRIPTNYA
                    }
                */
                if(auth.currentUser.uid !== data.key && nama.toLowerCase().indexOf(input.toLowerCase()) !== -1) {
                    /*
                        HANYA TAMPILKAN JIKA
                        1. ID KITA BEDA DENGAN BEBERAPA HASIL PENCARIAN ID ORANG LAIN
                        2. NAMA YANG DICARI ITU "INCLUDES" DI NAMA YANGN DITEMUKAN
                    */
                    this.list = document.createElement("div");
                    this.list.classList.add("kartu");
                    this.list.setAttribute("data-uid", data.key)
                    this.list.innerHTML = (`
                        <div class="detail">
                            <img width="35" height="35" src="${snap.foto?snap.foto:snap.photo}" />
                            <div class="nama">
                            </div>
                            </div>
                        <div class="status ${snap.status ? snap.status : 'online'}">
                        ${snap.status ? snap.status : 'online'}</div>
                    `);
                    this.list.querySelector(`.kartu .nama`).innerText = snap.nama ? snap.nama : snap.displayName; // IF ELSE
                    this.element.prepend(this.list); // MASUKKIN DIVNYA
                    // LISTENER JIKA DIKLIK
                    this.list.onclick = () => new Pengguna(data.key).init(document.querySelector(".container"));
                }
            })
        });
        // HAPUS FORM ELEMENTNYA
        this.cariElement.remove();
        // TAMPILKAN DI SETELAH AKUN TERAKHIR
        this.habis();
    }
    navbar(container) {
        // NYALAIN TOMBOLNYA (TAMBAH CLASS ACTIVE DI DIVNYA)
        container.querySelector(".header .cari").classList.add("active");
    }
    state() {
        // GANTI LAST ACTIVITY
        userState.changeLast("cari");
        // SIMPAN  PERUBAHANNYA
        new Activity().save();
    }
    habis() {
        // TEKS SETELAH AKUN TERAKHIR
        this.noMore = document.createElement("div");
        this.noMore.classList.add("nomore");
        this.noMore.innerHTML = this.selang.cari.nomore;
        this.element.appendChild(this.noMore);
    }
    init(container) {
        // INI SEMUA YANG AKAN DIJALANKAN SECARA LANGSUNG SETELAH DIPANGGIL
        new Landing().end();
        new Dashboard().createElement();
        this.navbar(container);
        this.createElement();
        container.appendChild(this.element);
        this.state();
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/