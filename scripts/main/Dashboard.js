class Dashboard {
    constructor() {
        // AMBIL CLASS CONTAINER DARI HTML
        this.container = document.querySelector(".container");
        this.opsi = false;

        // IMPORT DARI FILE BAHASA
        this.selang = window.Bahasa[userState.last_lang];
    }

    createElement() {
        // BIKIN DIV BARU DENGAN CLASS HEADER
        this.header = document.createElement("div");
        this.header.classList.add("header");
        this.header.innerHTML = (`
            <div class="judul">KIRIMIN</div>
            <div class="opsi">
                <div class="opsiBtn">
                    <button class="cari">
                        <i class="fa-regular fa-search"></i>
                    </button>
                    <button class="lainnya">
                        <i data-symbol="menu" class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </div>
            </div>
        `);
        // BIKIN DIV BARU DENGAN CLASS NAVBAR
        this.navbar = document.createElement("div");
        this.navbar.classList.add("navbar");
        this.navbar.innerHTML = (`
            <button class="bar-1 pesan"><i class="fa-light fa-message-dots"></i> ${this.selang.dashboard.navbarPesan}</button>
            <button class="bar-1 random"><i class="fa-light fa-shuffle"></i> ${this.selang.dashboard.navbarRandom}</button>
            <button class="bar-1 grup"><i class="fa-light fa-user-group"></i> ${this.selang.dashboard.navbarGrup}</button>
            <button class="bar-1 post"><i class="fa-light fa-image-polaroid-user"></i> ${this.selang.dashboard.navbarKiriman}</button>
        `);
        // MASUKKAN 2 DIV BARU KE CONTAINER
        this.container.appendChild(this.header);
        this.container.appendChild(this.navbar);
        // DETEKSI TOMBOL
        this.options();
    }

    detectLastActivity() {
        // DETEKSI LAST ACTIVITY UNTUK LANGSUNG MEMBUKA ACTIVITY TERSEBUT
        try {
            // CEK APAKAH LAST ACTIVITY SUDAH ADA DAN ISIANNYA AMAN
            const last = userState.last;
            if (last == "profil") {
                new Profil(auth.currentUser.uid).init(this.container);
            } else if (last == "first") {
                userState.changeLast("profil");
                new Activity().save();
                window.location.reload();
            } else if (last == "listChat") {
                new ListPesan().init(this.container);
            } else if (last == "listGrup") {
                new ListGrup().init(this.container);
            } else if (last == "listPost") {
                new ListPost().init(this.container);
            } else if (last == "random") {
                new Random().init(this.container);
            } else if (last == "cari") {
                new Cari().init(this.container);
            } else if (last == "chat") {
                new Pesan({
                    uid: userState.last_visited_uid,
                    nama: userState.last_visited_name,
                    foto: userState.last_visited_picture
                }).init(this.container);
            } else if (last == "global") {
                new Global().init(this.container);
            } else if (last == "grup") {
                new Grup({
                    uid: userState.last_visited_uid,
                    nama: userState.last_visited_name,
                    foto: userState.last_visited_picture,
                    member: userState.last_guild_member_count,
                    owner: userState.last_guild_member_owner
                }).init(this.container);
            } else {
                new ListPesan().init(this.container);
            }
        } catch {
            // KALO BELUM ADA, GA LENGKAP, ADA PERUBAHAN TAK DIKENAL, ATAU ISIANNYA GA AMAN
            new Profil(auth.currentUser.uid).init(this.container);
        }
    }

    getOptions() {
        // BIKIN DIV MIRIP DROP DOWN
        this.optionElement = document.createElement("div");
        this.optionElement.classList.add("Options");
        this.optionElement.innerHTML = (`
            <button class="opt-profil">${this.selang.dashboard.optProfil}</button>
            <button class="opt-tema">${this.selang.dashboard.optTema}</button>
            <button class="opt-library">${this.selang.dashboard.optLibrary}</button>
            <br/>
            <button class="opt-logout">${this.selang.dashboard.optKeluar}</button>
        `);
        if (this.opsi === false) {
            // KALO DIKLIK PERTAMA KALI, MAKA MASUKKIN DIVNYA KE HEADER DI CONTAINER
            this.container.querySelector(".header").appendChild(this.optionElement);
            this.container.querySelector(`.header .lainnya [data-symbol="menu"]`).classList.remove("fa-ellipsis-vertical");
            this.container.querySelector(`.header .lainnya [data-symbol="menu"]`).classList.add("fa-x");
            this.opsi = true;
        } else {
            // KALO DIKLIK UNTUK YANG KEDUA KALINYA, MAKA HAPUS DIVNYA
            this.container.querySelector(".header .Options").remove();
            this.container.querySelector(`.header .lainnya [data-symbol="menu"]`).classList.remove("fa-x");
            this.container.querySelector(`.header .lainnya [data-symbol="menu"]`).classList.add("fa-ellipsis-vertical");
            this.opsi = false;
        }

        // TOMBOL PROFIL DIKLIK = MEMBUKA PROFIL USER
        this.optionElement.querySelector(".opt-profil").onclick = () => new Profil(auth.currentUser.uid).init(this.container);
        // TOMBOL LIBRARY DIKLIK = MEMBUKA HALAMAN LIBRARY
        this.optionElement.querySelector(".opt-library").onclick = () => new Library().init(document.querySelector(".container"));
        // TOMBOL GANTI TEMA DIKLIK = KONFIRMASI PERUBAHAN TEMA
        this.optionElement.querySelector(".opt-tema").onclick = () => Notipin.Confirm({
            msg: this.selang.dashboard.notipinTema,
            onYes: () => this.theme(),
            type: "blue",
            mode: "dark"
        });
        // TOMBOL LOGOUT DIKLIK = KONFIRMASI SIGNOUT
        this.optionElement.querySelector(".opt-logout").onclick = () => Notipin.Confirm({
            msg: this.selang.dashboard.notipinKeluar,
            iyaText: "KELUAR",
            tidakText: "BATAL",
            onYes: () => this.logout(),
            type: "danger",
            mode: "dark"
        });
    }

    logout() {
        // UPDATE STATUS USERNYA MENJADI OFFLINE
        rdb.ref('users').child(auth.currentUser.uid).update({
            status: "offline"
        });
        // HAPUS ISI DI LOCAL STORAGE
        window.localStorage.removeItem("kirimin_lastActivity");
        // KELUAR DARI AKUN USER DAN REFRESH PAGENYA
        auth.signOut().then(() => {
            window.location.reload();
        })
    }

    pencarian() {
        // JALANKAN CLASS CARI
        new Cari().init(document.querySelector(".container"));
    }

    options() {
        const menu = this.container.querySelector(".header .lainnya");
        // LISTENER TOMBOL TITIK 3 DI KANAN ATAS JIKA DIKLIK
        menu.onclick = () => this.getOptions();
        
        const search = this.container.querySelector(".header .cari");
        // LISTENER TOMBOL PENCARIAN DI KANAN ATAS JIKA DIKLIK
        search.onclick = () => this.pencarian();

        // LISTENER MASING-MASING NAVBAR JIKA DIKLIK AKAN MENJALANKAN CLASSNYA MASING-MASING
        this.container.querySelector(".navbar .grup").onclick = () => new ListGrup().init(this.container);
        this.container.querySelector(".navbar .pesan").onclick = () => new ListPesan().init(this.container);
        this.container.querySelector(".navbar .post").onclick = () => new ListPost().init(this.container);
        this.container.querySelector(".navbar .random").onclick = () => new Random().init(this.container);
    }

    theme() {
        // BACA TEMA TERAKHIR YANG DITERAPKAN SEBELUMNYA
        const tema = userState.last_theme;
        const menu = this.container.querySelector(".header .lainnya");
        if (tema == "dark") {
            // GANTI TEMA TERAKHIRNYA
            userState.changeTema("light");
            // SIMPAN AKTIVITAS GANTI TEMANYA
            new Activity().save();
            // JALANKAN ANIMASI PERGANTIAN TEMANYA
            new Tema(tema).init(document.querySelector(".container"));
        } else {
            // SAMA KAYA DIATAS
            userState.changeTema("dark");
            new Activity().save();
            new Tema(tema).init(document.querySelector(".container"));
        }
        // AUTO KLIK SETELAH GANTI TEMA
        menu.click();
    }

    ukuranLayarChat() {
        /*
            NIATNYA MAU BIKIN RESPONSIVE BANGET,
            TAPI BISANYA CUMA RESPONSIVE AJA.
            KALO MAU BIKININ YANG RESPONSIVE BANGET.
            KALO MAU DISUBMIT JUGA AKAN SAYA TERIMA
        */
        const width = window.innerWidth;
        if(width >= 950) { // JIKA LEBAR LAYAR DI ATAS 949px
            if(!this.header || this.header == null) { // DAN JIKA GAADA HEADERNYA
                new Dashboard().createElement(); // MAKA MASUKKIN DIV HEADERNYA
            } else { // TAPI ADA HEADERNYA
                return; // MAKA JANGAN LAKUKAN APA-APA DAN STOP
            }
        } else { // JIKA LEBAR LAYAR DI BAWAH 950px
            if(this.header) { // DAN ADA HEADERNYA
                this.header.remove(); // MAKA HAPUS HEADERNYA
                this.navbar.remove(); // SERTA NAVBARNYA JUGA
            } else { // TAPI GADA HEADERNYA
                return; // MAKA JANGAN LAKUKAN APA-APA DAN STOP
            }
        }
    }

    async init() {
        /*

        INIT AKAN KITA PANGGIL SEPANJANG WAKTU,
        SEMOGA TIDAK BOSAN YA.. HAHAHA.
        
        */

        // BERSIHKAN TERLEBIH DAHULU SEMUANYA
        new Landing().end();
        // AMBIL DARI ACTIVITY
        this.activity = new Activity();
        const saveFile = this.activity.getSaveFile();
        if (saveFile) {
            // LOAD ACTIVITYNYA AGAR SESUAI DENGAN LOCAL STORAGE
            this.activity.load()
        };
        // DETEKSI STATUS DI DATABASE
        let userRef = rdb.ref('users').child(auth.currentUser.uid);
        await userRef.once("value", (key) => {
            // PERBARUI BEBERAPA DATA KHUSUS YANG BERHUBUNGAN DENGAN PROVIDER SAJA
            userRef.update({
                displayName: auth.currentUser.displayName,
                photo: auth.currentUser.photoURL,
                email: auth.currentUser.email,
            });

            try {
                // KALO STATUSNYA ADA TAPI ISINYA ADALAH SEBAGAI BERIKUT
                if (typeof (key.val().status) == "undefined" || key.val().status === "offline" || TypeError) {
                    // JIKA STATUSNYA ADALAH OFFLINE MAKA GANTI DENGAN ONLINE
                    userRef.update({
                        status: "online"
                    });
                }
            } catch {
                // KALO GADA KEY STATUSNYA
                // PAKSA BIKIN STATUSNYA MENJADI ONLINE
                userRef.update({
                    status: "online"
                });
            }
        })
        // BIKIN ROOM DARI LAST ACTIVITY
        this.detectLastActivity();
        // JIKA USER DISCONNECT, MAKA STATUSNYA AKAN DIGANTI MENJADI OFFLINE
        userRef.onDisconnect().update({
            status: "offline"
        });
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/