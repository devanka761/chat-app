class ListPesan {
    createElement() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        // BIKIN DIV BARU DENGAN CLASS LIST CHAT
        this.element = document.createElement("div");
        this.element.classList.add("ListChat");
    }

    getUser() {
        rdb.ref('teman').once('value', (akun) => { //  BACA FOLDER TEMAN
            this.element.innerHTML = ""; // KOSONGIN ISI LIST CHATNYA
            if(akun.exists()) { // KALO ADA KEY DI FOLDER TEMAN
                akun.forEach(data => { // BACA MASING-MASING KEY
                    /* SEDIKIT PENJELASAN!!
                        JADI AKAN ADA 2 KEMUNGKINAN YANG TERJADI..
                        1. KEY TEMAN = USER ID   & KEY SAYA = FRIEND ID
                        2. KEY TEMAN = FRIEND ID & KEY SAYA = USER ID
                        POSISI KITA SEBAGAI USER ID BISA SAJA MENJADI FRIEND ID BAGI USER LAIN
                        TAPI BISA SAJA JUGA TETAP MENJADI USER ID BAGI USER LAIN
                        MAKA 2 KEMUNGKINAN TERSEBUT AKAN KITA PECAHKAN PADA IF ELSE DI SINI
                    */
                    if(data.val().temanId === auth.currentUser.uid) { // kasus1: KALO KEY TEMAN SAMA DENGAN USER ID
                        rdb.ref("users").child(data.val().sayaId).once("value", (lain) => { // MAKA BACA KEY SAYA
                        const snap = lain.val();
                        this.list = document.createElement("div");
                        this.list.classList.add("kartu");
                        this.list.setAttribute("data-uid", lain.key)
                        this.list.innerHTML = (`
                        <div class="detail">
                        <img width="35" height="35" src="${snap.foto?snap.foto:snap.photo}" />
                            <div class="nama">
                            </div>
                        </div>
                        <div class="status ${snap.status ? snap.status : 'online'}">
                        ${snap.status ? snap.status : 'online'}</div>
                        `);
                        // TAMPILKAN INFORMASI LAWAN CHATTING KTIA
                        this.list.querySelector(`.nama`).innerText = snap.nama ? snap.nama : snap.displayName;
                        this.element.prepend(this.list); // MASUKIN KE LIST CHAT
                        // LISTENER KARTU LISTNYA DIKLIK
                        this.list.onclick = () => this.openChat(lain.key, snap.nama ? snap.nama : snap.displayName, snap.foto?snap.foto:snap.photo);
                    })
                } else if(data.val().sayaId === auth.currentUser.uid) { // kasus2: KALO KEY SAYA SAMA DENGAN USER ID
                    rdb.ref("users").child(data.val().temanId).once("value", (lain) => { // MAKA BACA KEY TEMAN
                        const snap = lain.val();
                        this.list = document.createElement("div");
                        this.list.classList.add("kartu");
                        this.list.setAttribute("data-uid", lain.key)
                        this.list.innerHTML = (`
                        <div class="detail">
                        <img width="35" height="35" src="${snap.foto?snap.foto:snap.photo}" />
                        <div class="nama">
                        </div>
                        </div>
                        <div class="status ${snap.status ? snap.status : 'online'}">
                        ${snap.status ? snap.status : 'online'}</div>
                        `);
                        // TAMPILKAN INFORMASI LAWAN CHATTING KTIA
                        this.list.querySelector(`.nama`).innerText = snap.nama ? snap.nama : snap.displayName;
                        this.element.prepend(this.list); // MASUKIN KE LIST CHAT
                        // LISTENER KARTU LISTNYA DIKLIK
                        this.list.onclick = () => this.openChat(lain.key, snap.nama ? snap.nama : snap.displayName, snap.foto?snap.foto:snap.photo);
                        })
                    } else { // SELAIN 2 KASUS TERSEBUT, JANGAN LAKUKAN APA-APA
                    }
                })
            }
            this.habis(); // TAMPILKAN SETELAH KARTU TERAKHIR
        })
    }

    habis() {
        this.noMore = document.createElement("div");
        this.noMore.classList.add("nomore");
        this.noMore.innerHTML = this.selang.list_pesan.nomore;
        
        // DIV BARU UNTUK TOMBOL CHAT GLOBAL
        this.global = document.createElement("div");
        this.global.classList.add("tombol");
        this.global.setAttribute("data-global", auth.currentUser.uid);
        this.global.innerHTML = (`
            <button class="btn-1 hijau create"><i class="fa-light fa-globe"></i> GLOBAL CHAT</button>
        `)

        // MASUKIN 2 DIV KE LIST CHAT
        this.element.appendChild(this.noMore);
        this.element.appendChild(this.global);
        // LISTENER TOMBOL CHAT GLOBAL DIKLIK
        this.global.onclick = () => new Global().init(document.querySelector(".container"));
    }

    refreshUser() {
        const container = document.querySelector(".container");
        // GANTI LIST SEBELUMNYA MENJADI LIST TERBARU APABILA ADA DATA YANG BERUBAH
        rdb.ref("users").on("child_changed", () => {
            this.element.remove();
            this.createElement();
            this.getUser();
            container.appendChild(this.element);
        });
    }

    openChat(uid, nama, foto) {
        // TUTUP ELEMENT INI
        this.close();
        // JALANKAN INSTANCE PESANNYA
        this.pesan = new Pesan({
            uid: uid,
            nama: nama,
            foto: foto
        });
        // SISIPKAN CONTAINER KE DALAM INIT -- PARAMETER --
        this.pesan.init(document.querySelector(".container"));
    }

    navbar(container) {
        container.querySelector(".navbar .pesan").classList.add("active");
    }

    state() {
        // PUSH KE USERSTATE
        userState.changeLast("listChat");
        // SIMPAN KE LOCALSTORAGE
        new Activity().save();
    }

    close() {
        // HAPUS LIST CHAT
        if(this.element) {this.element.remove()};
        // MATIKAN USER REF
        rdb.ref("users").off();
    }

    init(container) {
        new Landing().end();
        // BIKIN HEADER DAN NAVBAR
        new Dashboard().createElement();
        // GANTI HIGHLIGHT NAVBAR
        this.navbar(container);
        // BIKIN DIV BARU
        this.createElement();
        // AMBIL DATA USER
        this.getUser();
        // JALANKAN PENDETEKSI JIKA ADA DATA YANG BERUBAH
        this.refreshUser();
        // MASUKKAN DIV BARU KE CONTAINER
        container.appendChild(this.element);
        // LETAKKAN DI USERSTATE
        this.state()
    }
}