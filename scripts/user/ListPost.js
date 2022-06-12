class ListPost {
    constructor() {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        this.send = false; // TOMBOL KIRIM DEFAULT FALSE (UNTUK KOMENTAR)
    }
    createElement() {
        // DIV BARU LIST POST (COPAS DARI LIST CHAT)
        this.element = document.createElement("div");
        this.element.classList.add("ListChat", "Post");
        this.element.innerHTML = (`
        <button class="btn-1 upload hijau">
            <i class="fa-solid fa-plus"></i> ${this.selang.list_post.tombolBuat}
        </button>
        `);
        // LISTENER TOMBOL UPLOAD DIKLIK
        this.element.querySelector(".upload").onclick = () => this.makePost();
    }

    getPost() {
        // BACA FOLDER POST
        rdb.ref("post").limitToLast(50).orderByKey().once("value", (post) => {
            post.forEach(data => { // BACA MASING-MASING KEY POST
                const snap = data.val();
                this.postElement = document.createElement("div");
                this.postElement.classList.add("Post-Card", data.key);
                this.postElement.innerHTML = (`
                    <div class="atas">
                        <div class="foto">
                            <img data-img="${data.key}" width="30" height="30" alt="">
                            <div class="nick" data-nick="${data.key}"></div>
                        </div>
                        <div class="tanggal" data-hapus="${data.key}">${snap.tanggal}</div>
                    </div>
                    <div class="postingan">
                        <img src="${snap.gambar}" alt="foto"/>
                    </div>
                    <div class="data">
                        <div class="statistik">
                            <div class="like" data-like="${data.key}">
                            </div>
                            <div class="comment" data-comment="${data.key}">
                                <i class="fa-light fa-comment"></i> 
                            </div>
                        </div>
                        <div class="jam">${snap.jam}</div>
                    </div>
                    <div class="tulisan">
                        <p></p>
                    </div>
                `);
                // TAMPILKAN INFORMASI POSTINGAN
                const like = this.postElement.querySelector(`.statistik [data-like="${data.key}"]`);
                const comment = this.postElement.querySelector(`.statistik [data-comment="${data.key}"`);
                const username = this.postElement.querySelector(`.foto [data-nick="${data.key}"]`);
                const foto = this.postElement.querySelector(`.foto img[data-img="${data.key}"]`)
                const hapusEl = this.postElement.querySelector(`.atas .tanggal[data-hapus="${data.key}"]`);
                // JALANKAN 2 HAL BERIKUT
                this.getName(username, data.val().uid, comment, data.key, snap.pesan, foto, hapusEl);
                this.getLikes(like, data.key);
                // LISTENER NAMA/FOTO PENGIRIM DIKLIK
                this.postElement.querySelector(".foto").onclick = () => this.seleksiAkun(snap.uid);
                // ISI POSTINGAN
                this.postElement.querySelector(".tulisan p").innerText = snap.pesan;
                // JALANKAN JUGA SELEKSI POSTINGAN SETELAH POSTINGAN DIDAPATKAN
                this.seleksiPostingan(this.postElement, snap.uid, data.val().tipe);
            });
        })
    }

    seleksiPostingan(postElement, uid, tipe) {
        if(tipe === "public" || uid === auth.currentUser.uid) { // KALO POSTINGANNYA DIATUR UNTUK PUBLIC OLEH PERNGIRIM
            this.element.prepend(postElement); // MAKA TAMPILKAN POSTINGANNYA
        } else { // KALO DIATUR UNTUK PRIVATE/FOLLOWER ONLY
            rdb.ref("users/"+uid+"/follower").once("value", (akun) => { // BACA FOLDER FOLLOWER DI AKUN PENGIRIM
                if(akun.exists()) { // KALO ADA KEY DI FOLDERNYA
                    akun.forEach((listing) => { // BACA MASING-MASING KEY
                        if(listing.key === auth.currentUser.uid) { // KALO ADA SALAH SATU KEY = ID KITA
                            this.element.prepend(postElement); // MAKA TAMPILKAN POSTINGANNTA
                        }
                    })
                }
            })
        }
    }

    getName(nameEl, key, comment, datakey, pesan, fotoEl, hapusEl) {
        rdb.ref("users").child(key).once("value", (data) => { // BACA DARI PENGIRIM POSTINGAN
            const snap = data.val().nama?data.val().nama:data.val().displayName; // (selengkapnya ada di file cari.js baris 57)
            const foto = data.val().foto?data.val().foto:data.val().photo; // ini juga
            nameEl.innerText = snap; // TAMPILKAN NAMA PENGIRIM
            fotoEl.src = foto; // TAMPILKAN FOTO PERNGIRIM
            this.getComment(comment, datakey, snap, pesan); // LANGSUNG JALANKAN getComment()
            if(auth.currentUser.uid == key) { // KALO ID PENGIRIMNYA = ID KITA
                const hapusPost = document.createElement("i");
                hapusPost.classList.add("fa-solid", "fa-trash-can", "postrash");
                // MUNCULIN TOMBOL HAPUS POST
                hapusEl.appendChild(hapusPost);
                hapusPost.onclick = () => Notipin.Confirm({ // LISTENER TOMBOL HAPUS POST
                    msg: this.selang.list_post.notipinHapus,
                    yes: "YAKIN",
                    no: "BATAL",
                    type: "danger",
                    mode: "dark",
                    onYes: () => this.tarikPost(datakey)
                });
            }
        });
    }

    tarikPost(postkey) {
        rdb.ref("post/"+postkey).once("value", (data) => { // BACA KEY POSTINGANNYA
            const path = data.val().path; // PATH KE FOLDER GAMBAR POSTINGANNYA
            stg.ref(path).delete(() => { // HAPUS GAMBAR DARI STORAGE
            }).then(() => { // KALO UDAH
                rdb.ref("post/"+postkey).remove(); // HAPUS FOLDER KEY POSTINGANNYA
                new ListPost().init(document.querySelector(".container")); // KEMBALI KE LIST POST
            }).catch((err) => console.log(err));
        });
    }

    getLikes(likeEl, key) {
        // BACA LIKE DI FOLDER KEY POSTINGANNYA TERSEBUT PASTIKAN ADA ID KITA
        rdb.ref("post/"+ key +"/like").child(auth.currentUser.uid).once("value", (data) => {
            if(data.exists()) { // KALO KITA UDAH LIKE
                likeEl.innerHTML = `<i class="fa-solid fa-heart"></i> `;
                // DAN KALO DIKLIK LIKENYA, MAKA USER AKAN JALANKAN removeLike();
                likeEl.onclick = () => this.removeLike(likeEl, key);
            } else { // KALO KITA BELUM LIKE
                likeEl.innerHTML = `<i class="fa-light fa-heart"></i> `;
                // DAN KALO DIKLIK LIKENYA, MAKA USER AKAN JALANKAN addLike();
                likeEl.onclick = () => this.addLike(likeEl, key);
            }
        })
        // BACA KEY LIKE DI DALAM FOLDER LIKE DI DALAM (LAGI) FOLDER POSTINGANNYA
        rdb.ref("post/" + key + "/like").once("value", (likes) => {
            if(likes.exists()) { // KALO ADA, HITUNG JUMLAH KEYNYA
                likeEl.append(likes.numChildren());
            } else { // KALO GADA, KASIH STRING 0
                likeEl.append("0")
            }
        })
    }
    addLike(likeEl, key) {
        // TAMBAHKAN ID KITA KE DALAM KEY LIKE DI DALAM FOLDER POSTINGANNYA
        rdb.ref("post/"+ key +"/like").child(auth.currentUser.uid).set({
            liked: true
        });
        // UPDATE JUMLAH LIKENYA
        this.getLikes(likeEl, key);
    }
    removeLike(likeEl, key) {
        // HAPUS ID KITA DARI DALAM KEY LIKE DI DALAM FOLDER POSTINGANNYA
        rdb.ref("post/"+ key +"/like").child(auth.currentUser.uid).remove();
        // UPDATE JUMLAH LIKENYA
        this.getLikes(likeEl, key);
    }
    getComment(commentEl, key, nama, pesan) {
        // SAMA KAYA getLike();
        rdb.ref("post/" + key +"/comment").once("value", (comments) => {
            if(comments.exists()) {
                commentEl.append(comments.numChildren());
            } else {
                commentEl.append("0");
            }
        })
        // LISTENER TOMBOL KOMENTAR
        commentEl.onclick = () => this.openComment(commentEl, key, nama, pesan)
    }

    openComment(commentEl, key, nama, pesan) {
        // DIV BARU UNTUK LIST KOMENTAR
        this.commentElement = document.createElement("div");
        this.commentElement.classList.add("Comment");
        this.commentElement.innerHTML = (`
            <div class="komentar">
                <div class="comment-card">
                    <div class="depan pengirim">
                        <div class="foto">
                            <button class="back btn-1 clean">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                        </div>
                        <div class="tengah">
                            <div class="pesan">
                                <p></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="inputan">
                <input type="text" maxlength="200" placeholder="${this.selang.list_post.inputPesan}" data-input="${auth.currentUser.uid}"/>
                <button class="btn-1 send biru" data-send="${auth.currentUser.uid}">
                    <i class="fa-solid fa-angles-right"></i>
                </button>
            </div>
        `);
        // LISTENER TOMBOL KEMBALI (BALIK KE LIST POST)
        this.commentElement.querySelector(".depan .foto .back").onclick = () => this.commentElement.remove();
        // TAMPILKAN INFORMASI PENGIRIM
        this.commentElement.querySelector(".tengah .pesan p").innerText = "\n"+pesan;
        this.commentElement.querySelector(".tengah .pesan p").prepend(nama+":");
        const input = this.commentElement.querySelector(`.inputan input[data-input="${auth.currentUser.uid}"]`);
        const button = this.commentElement.querySelector(`.inputan [data-send="${auth.currentUser.uid}"]`);
        this.deteksiKirim(input, button, key, commentEl, nama, pesan); // JALANKAN LANGSUNG
        const komentar = this.commentElement.querySelector(".komentar");
        this.loadKomentar(komentar, key, commentEl, nama, pesan); // JALANKAN LANGSUNG
        this.element.appendChild(this.commentElement); // TIMPA KE LIST POST
        input.focus(); // FOKUS KE TEXT INPUT KOMENTAR
    }

    deteksiKirim(input, button, key, commentEl, nama, pesan) { // SAMA SEPERTI DI GLOBAL
        input.onkeydown = () => {
            if (input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") {
                this.send = false;
            } else {
                this.send = true;
            }
        }
        input.onkeyup = () => {
            if (input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") {
                this.send = false;
            } else {
                this.send = true;
            }
        }
        input.onkeypress = (e) => {
            if(e.keyCode == 13) {
                if(input.value.replace(/^\s+/g, '') == "" || input.value.replace(/^\s+/g, '') == " ") return;
                this.send = true;
                button.click();
            }
        }

        button.onclick = () => {
            if(this.send === true) {
                this.kirimKomentar(input.value.replace(/^\s+/g, ''), key, commentEl, nama, pesan);
                input.value = "";
                input.focus();
                this.send = false;
            } else {
                return;
            }
        }
    }

    kirimKomentar(input, key, commentEl, nama, pesan) {
        // MASUKKIN HASIL KOMENTAR DI DALAM KEY KOMENTAR DI DALAM (LAGI) FOLDER POSTINGAN
        rdb.ref("post/" + key + "/comment").child(new Date().getTime()).set({
            uid: auth.currentUser.uid,
            pesan: input,
            tanggal: tgl,
            jam: jam
        });
        // RELOAD ELEMENT LIST KOMENTARNYA
        this.commentElement.remove();
        this.openComment(commentEl, key, nama, pesan);
    }

    loadKomentar(element, key, commentEl, namee, pesan) {
        // BACA FOLDER KOMENTARNYA
        rdb.ref("post/" + key + "/comment").limitToLast(50).orderByKey().once("value", (comments) => {
            if(comments.exists()) { // KALO ADA KEY DI DALAMNYA
                comments.forEach(data => { // BACA MASING-MASING KEY
                    // BIKIN DIV BARU UNTUK KARTU KOMENTAR
                    this.list = document.createElement("div");
                    this.list.classList.add("comment-card", data.key);
                    this.list.innerHTML = (`
                        <div class="depan">
                            <div class="foto" data-foto="${data.key}">
                            </div>
                            <div class="tengah">
                                <div class="pesan">
                                    <p><b data-nick="${data.key}"></b> </p>
                                </div>
                            </div>
                        </div>
                        <div class="data" data-data="${data.key}">
                            <div class="jam">${data.val().jam}</div>
                            <div class="tanggal">${data.val().tanggal}</div>
                        </div>
                    `);
                    // TAMPILKAN INFORMASI KOMENTARNYA
                    this.list.querySelector(".tengah .pesan p").append(data.val().pesan);
                    const foto = this.list.querySelector(`.depan .foto[data-foto="${data.key}"]`);
                    const nama = this.list.querySelector(`.depan .tengah .pesan [data-nick="${data.key}"]`);
                    const metadata = this.list.querySelector(`[data-data="${data.key}"]`);
                    // LANGSUNG JALANKAN
                    this.getUserComment(data.val().uid, foto, nama, metadata, key, data.key, commentEl, namee, pesan);
                    element.appendChild(this.list); // MASUKIN KE LIST KOMENTAR
                })
            } else {
                //
            }
        })
    }

    getUserComment(uid, fotoEl, namaEl, metadata, key, datakey, commentEl, nama, pesan) {
        // BACA FOLDER AKUN USER
        rdb.ref("users/" + uid).once("value", (data) => {
            const snap = data.val();
            const foto = snap.foto?snap.foto:snap.photo;
            const nama = snap.nama?snap.nama:snap.displayName;
            // TAMPILKAN INFORMASINYA KE KARTU KOMENTAR
            fotoEl.innerHTML = `<img width="30" height="30" src="${foto}" />`;
            namaEl.innerText = nama;
            // KALO FOTO/NAMA DIKLIK, JALANKAN seleksiAkun();
            namaEl.onclick = () => this.seleksiAkun(uid);
            fotoEl.onclick = () => this.seleksiAkun(uid);
        });
        if(uid == auth.currentUser.uid) {
            // KALO KEYNYA = ID KITA
            const hapus = document.createElement("i");
            hapus.classList.add("fa-solid", "fa-trash-can");
            metadata.appendChild(hapus); // MUNCULIN TOMBOL HAPUS
            hapus.onclick = () => { // LISTENER TOMBOL HAPUS
                Notipin.Confirm({
                    msg: this.selang.list_post.notipinTarik,
                    onYes: () => this.delComment(key, datakey, commentEl, nama, pesan),
                    type: "danger",
                    mode: "dark"
                });
            }
        }
    }

    delComment(key, datakey, commentEl, nama, pesan) {
        rdb.ref("post/"+key+"/comment/"+datakey).remove(); // HAPUS FOLDER KEY KOMENTAR TERSEBUT
        // RELOAD LIST KOMENTARNYA
        this.commentElement.remove();
        this.openComment(commentEl, key, nama, pesan);
    }

    seleksiAkun(uid) {
        // KALO KEYNYA SAMA DENGAN ID KITA, MAKA BUKA PROFIL
        if(uid == auth.currentUser.uid) return new Profil(auth.currentUser.uid).init(document.querySelector(".container"));
        // KALO BUKAN SAMA DENGAN ID KITA, MAKA BUKA INFORMASI PENGGUNA
        new Pengguna(uid).init(document.querySelector(".container"));
    }
    makePost() {
        // DIV BIKIN POSTINGAN
        this.makeElement = document.createElement("div");
        this.makeElement.classList.add("createGrup");
        this.makeElement.innerHTML = (`
            <div class="title">${this.selang.list_post.tombolBuat}</div>
            <div class="error"></div>
            <select class="specify">
                <option value="public">${this.selang.list_post.pilihPublik}</option>
                <option value="particular">${this.selang.list_post.pilihPengikut}</option>
            </select>
            <div class="preview">
                <button class="btn-1 pilih biru">
                    <i class="fa-solid fa-image"></i> ${this.selang.list_post.inputGambar}
                </button>
            </div>
            <div class="inputan">
                <textarea data-kiriman="${auth.currentUser.uid}" type="text" placeholder="${this.selang.list_post.inputSesuatu}" maxlength="300"></textarea>
            </div>
            <div class="tombolan">
                <button class="btn-1 merah cancel"><i class="fa-duotone fa-circle-x"></i> ${this.selang.list_post.tombolBatal}</button>
                <button class="btn-1 hijau done"><i class="fa-duotone fa-circle-check"></i> ${this.selang.list_post.tombolLanjut}</button>
            </div>
        `);
        this.makeElement.querySelector(".pilih").onclick = () => this.inputFoto(); // LISTENER TOMBOL FILE INPUT
        this.makeElement.querySelector(".tombolan .cancel").onclick = () => { // LISTENER TOMBOL BATAL
            if(this.inputElement) {this.inputElement.remove()}; // KEMBALIKAN KE LIST POST
            this.makeElement.remove();
        }
        this.makeElement.querySelector(".tombolan .done").onclick = () => this.dapatkanKiriman(); // LISTENER TOMBOL SUBMIT
        this.element.appendChild(this.makeElement); // MASUKIN KE LIST POST
    }
    inputFoto() {
        // SAMA KAYA UP FOTO PROFIL GUILD
        this.inputElement = document.createElement("input");
        this.inputElement.setAttribute("type", "file");
        this.inputElement.setAttribute("accept", "image/*")
        this.inputElement.click();
        this.inputElement.onchange = () => this.datapkanFoto();
    }
    datapkanFoto() {
        // SAMA KAYA UP FOTO PROFIL GUILD
        this.files = this.inputElement.files[0];
        if (!this.files.type.match("image/*")) return Notipin.Alert({mode: "dark", msg: this.selang.list_post.notipinTipeGambar});
        if(this.files) {
            const reader = new FileReader();
            reader.readAsDataURL(this.files);
            reader.onload = () => this.tampilkanFoto(reader.result);
        }

    }
    tampilkanFoto(res) {
        // KASIH PREVIEW SETELAH PILIH FILE
        const imgBefore = this.element.querySelector(".preview img");
        if(imgBefore) { imgBefore.remove() }; // HAPUS PREVIEW KALO SEBELUMNYA ADA PREVIEW
        const img = document.createElement("img");
        img.src = res;
        this.element.querySelector(".preview").appendChild(img); // TAMPILKAN PREVIEWNYA
    }

    dapatkanKiriman() {
        const erEl = this.makeElement.querySelector(".error"); // << ELEMENT INI GA JADI DIPAKE
        const selection = this.makeElement.querySelector(".specify"); // SELEKSI PUBLIC/FOLLOWER ONLY
        const text = this.makeElement.querySelector(`.inputan [data-kiriman="${auth.currentUser.uid}"]`); // TEXT INPUT
        const input = text.value.replace(/^\s+/g, ''); // TEXT INPUT VALUE TANPA WHITESPACE
        erEl.innerHTML = ""; // << GA JADI DIPAKE NI
        // KALO FILENYA BELUM DIPILIH KASIH ALERT DAN STOP SCRIPTNYA
        if(!this.files) return Notipin.Alert({mode: "dark", msg: "SILAKAN PILIH FILE GAMBAR"});
        this.submitKiriman(selection.value, input, this.files); // JALANKAN submitKiriman();
    }

    submitKiriman(spec, input, file) {
        const now = new Date().getTime(); // KASIH KEY
        const filename = file.name; // BACA NAMA FILE
        const postRef = stg.ref("post/" + now + "/" + filename); // PATH KE FOLDER STORAGE
        const postUp = postRef.put(file); // UPLOAD FILENYA

        // HAPUS SEMUA TOMBOL YANG BISA DIINTERAKSI SUPAYA TIDAK DOUBLE UPLOAD
        const selection = this.makeElement.querySelector(".specify");
        const inpfile = this.makeElement.querySelector(".pilih");
        const inputan = this.makeElement.querySelector(".inputan");
        const tombolan = this.makeElement.querySelector(".tombolan");
        selection.remove();
        inpfile.remove();
        inputan.remove();
        tombolan.remove();
        // KASIH LOADING
        const loader = document.createElement("div");
        loader.classList.add("loading");
        loader.innerHTML = (`<i class="fa-duotone fa-spinner"></i>`);
        this.makeElement.querySelector(".preview").prepend(loader);
        // PROSES UPLOAD (SAMA SEPERTI SEBELUMNYA)
        postUp.on("state_changed", () => {}, err  => {
            alert(err);
        }, () => {
            postUp.snapshot.ref.getDownloadURL().then(imgURL => {
                rdb.ref("users").child(auth.currentUser.uid).once("value", (akun) => {
                    const acc = akun.val();
                    rdb.ref("post").child(now).set({
                        pesan: input,
                        tipe: spec,
                        gambar: imgURL,
                        jam: jam,
                        tanggal: tgl,
                        uid: auth.currentUser.uid,
                        path: "post/" + now + "/" + filename
                    });
                })
            }).then(() => {
                loader.remove();
                this.inputElement.remove();
                this.makeElement.remove();
                new ListPost().init(document.querySelector(".container"));
            })
        })
    }
    state() {
        // GANTI LAST ACTIVITY DAN SIMPAN PERUBAHAN
        userState.changeLast("listPost");
        new Activity().save();
    }

    navbar(container) {
        // NYALAIN NAVBARNYA
        container.querySelector(".navbar .post").classList.add("active");
    }

    init(container) {
        // OTOMATIS JALANKAN SETELAH DIPANGGIL
        new Landing().end();
        new Dashboard().createElement();    
        this.createElement();
        container.appendChild(this.element);
        this.getPost();
        this.state();
        this.navbar(container)
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/