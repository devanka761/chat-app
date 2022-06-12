class Random {
    constructor() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        this.userList = []; // INI KARNA KITA AKAN PUSH DARI FOREACH TAPI GA JADI
    }

    createElement() {
        // DIV BARU
        this.element = document.createElement("div");
        this.element.classList.add("ListChat", "Random");
        this.element.innerHTML = (`
            <div class="desc">
                ${this.selang.random.judul}
            </div>
            <button class="btn-1 start hijau" data-start="${auth.currentUser.uid}"><i class="fa-light fa-play"></i> ${this.selang.random.tombolLanjut}
            </button>
        `);
        const start = this.element.querySelector(`[data-start="${auth.currentUser.uid}"]`);
        const desc = this.element.querySelector(".desc");
        // LISTENER TOMBOL START
        start.onclick = () => this.loadingUser(start, desc);
    }

    loadingUser(start, desc) {
        // DIV LOADING
        this.loader = document.createElement("div");
        this.loader.classList.add("loading");
        this.loader.innerHTML = (`<i class="fa-duotone fa-spinner"></i>`);
        // HAPUS 2 ELEMENT SEBELUMNYA
        start.remove();
        desc.remove();
        this.element.appendChild(this.loader); // TAMPILKAN DIV LOADING
        // BACA FOLDER USERS
        rdb.ref("users").once("value", (akun) => {
            this.semua = []; // INI KARNA KITA AKAN PUSH DARI FOREACH 
            akun.forEach(data => { // BACA MASING-MASING KEY
                // JIKA STATUSNYA BUKAN OFFLINE
                if(data.key !== auth.currentUser.uid &&
                    data.val().status === "online" ||
                    data.val().status === "busy" ||
                    data.val().status === "idle") {
                    this.akunList = data.key; // << SEBENERNYA PEMBOROSAN AOKWKWK BARU NYADAR, TAPI GAPAPA
                    this.semua.push(this.akunList); // PUSH KE this.semua
                } else {}
            })
            const found = this.semua[Math.floor(Math.random()*this.semua.length)]; // AMBIL SECARA RANDOM AKUNNYA
            // KASIH JARAK WAKTUNYA BIAR SEMAKIN BESAR KEMUNGKINAN AKUN YANG BERBEDA SETIAP KLIK
            setTimeout(() => this.seleksiUser(found, this.loader), 1000);
        })
    }

    seleksiUser(uid, loader) {
        this.element.removeChild(loader); // HAPUS LOADINGNYA
        if(typeof(uid) !== "undefined") { // KALO KEYNYA BUKAN UNDEFINED
            this.temukanUser(uid, loader); // JALANKAN temukanUser();
        } else { // KALO KEYNYA UNDEFINED (BERARTI SEMUA PENGGUNA SEDANG OFFLINE)
            Notipin.Confirm({
                // KONFIRMASI PENCARIAN RANDOM PENGGUNA OFFLINE
                msg: `${this.selang.random.notipinPengguna}`,
                onYes: () => this.loadOfflineUser(loader),
                onNo: () => new Random().init(document.querySelector(".container")),
                type: "info",
                mode: "dark"
            })
        }
    }

    loadOfflineUser(loader) {
        // MUNCULIN LOADING LAGI
        this.element.appendChild(loader);
        // SAMA SEPERTI DI ATAS, BEDANYA SEKARANG AKAN DISELEKSI TERMASUK YANG OFFLINE
        rdb.ref("users").once("value", (akun) => {
            this.semua = [];
            akun.forEach(data => {
                if(data.key !== auth.currentUser.uid) {
                    this.akunList = data.key;
                    this.semua.push(this.akunList);
                } else {}
            })
            const found = this.semua[Math.floor(Math.random()*this.semua.length)];
            setTimeout(() => this.seleksiUser(found, loader), 1000);
        })
    }

    temukanUser(uid, loader) {
        // HAPUS LOADINGNYA
        loader.remove();
        // BUKA PENGGUNA DENGAN ID TERSEBUT
        new Pengguna(uid).init(document.querySelector(".container"));
    }

    navbar(container) {
        // NYALAIN NAVBARNYA
        container.querySelector(".navbar .random").classList.add("active");
    }

    state() {
        // GANTI LAST ACTIVITY DAN SIMPAN PERUBAHAN
        userState.changeLast("random");
        new Activity().save();
    }

    init(container) {
        // OTOMATIS JALANKAN SETELAH DIPANGGIL
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