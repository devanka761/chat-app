class Pengguna {
    constructor(uid) {
        this.selang = window.Bahasa[userState.last_lang];
        this.uid = uid;
    }

    createElement() {
        // BIKIN DIV BARU DENGAN CLASS PROFIL
        this.element = document.createElement("div");
        this.element.classList.add("Profil");
        this.element.innerHTML = (`
        <div class="tentang">
            <div class="status lain">
            </div>
            <div class="foto lain">
            </div>
            <div class="nama">
                Loading
            </div>
            <div class="bio">
                <q>Loading</q>
            </div>
            <div class="follower">
                <div class="pengikut">
                </div>
            </div>
            <div class="tombolan">
                <button class="btn-1 follow biru">${this.selang.pengguna.tombolIkuti}</button>
                <button class="btn-1 chat hijau">${this.selang.pengguna.tombolChat}</button>
            </div>
            <button class="btn-1 done clean">${this.selang.pengguna.tombolTutup}</button>
        </div>
        `);
        // CLICK LISTENER UNTUK KEMBALI KE CHAT
        this.element.querySelector(".done").onclick = () => this.detectLastActivity();
    }

    getUser() {
        // SAMA DENGAN PROFIL TANPA TOMBOL EDIT
        rdb.ref("users").child(this.uid).once("value", (data) => {
            const snap = data.val();
            this.element.querySelector(".status").innerHTML = snap.status?snap.status:"Online";
            this.element.querySelector(".nama").innerText = snap.nama?`@${snap.nama}`:snap.displayName;
            this.element.querySelector(".bio").innerText = snap.bio?`“${snap.bio}”`:"Tidak Ada Bio";
            this.element.querySelector(".foto").style.backgroundImage = `url(${snap.foto?snap.foto:snap.photo})`;
            this.element.querySelector(".chat").onclick = () => {
                this.openChat(data.key, snap.nama ? snap.nama : snap.displayName, snap.foto?snap.foto:snap.photo);
            }
            this.getFollower(this.uid);
        });
        // BACA FOLDER FOLLOWER YANG TERDAPAT ID KITA
        this.following = rdb.ref("users/" + this.uid + "/follower").child(auth.currentUser.uid);
        this.following.once("value", data => {
            if(data.exists()) { // KALO ADA ID KITA DI DALAMNYA
                if(data.val().follow) { // DAN KALO SUDAH FOLLOW SEBELUMNYA
                    // SERTA KALO TOMBOLNYA DIKLIK
                    this.element.querySelector(".follow").onclick = () => Notipin.Confirm({
                        // KONFIRMASI UNTUK UNFOLLOW
                        msg: `${this.selang.pengguna.notipinBerhenti}`,
                        yes: "OKE",
                        no: "BATAL",
                        onYes: () => this.unfollow(this.uid),
                        mode: "dark",
                        type: "info"
                    })
                    // GANTI TULISANNYA MENJADI MENGIKUTI (note: yang terjadi sebelum konfirmasi unfollow)
                    this.element.querySelector(".follow").innerHTML = `${this.selang.pengguna.tombolMengikuti}`;
                } else { // KALO BELUM ADA
                    // DAN KALO TOMBOLNYA DIKLIK
                    this.element.querySelector(".follow").onclick = () => this.follow(this.uid); // JALANKAN follow();
                    // GANTI TULISANNYA MENJADI IKUTI (note: yang terjadi sebelum follow)
                    this.element.querySelector(".follow").innerHTML = `${this.selang.pengguna.tombolIkuti}`;
                }
            } else { // KALO ID KITA GADA DI DALAMNYA
                // DAN KALO TOMBOLNYA DIKLIK
                this.element.querySelector(".follow").onclick = () => this.follow(this.uid);
                // GANTI TULISANNYA MENJADI IKUTI (note: yang terjadi sebelum follow)
                this.element.querySelector(".follow").innerHTML = `${this.selang.pengguna.tombolIkuti}`;
            }
        })
    }

    getFollower(uid) {
        // BACA FOLDER FOLLOWER
        rdb.ref("users/" + uid + "/follower").once("value", data => {
            if(data.exists()) { // KALO ADA KEY DI DALAMNYA
                // HITUNG JUMLAH KEYNYA
                this.element.querySelector(".pengikut").innerHTML = `${this.selang.pengguna.pengikut}:${data.numChildren()}`;
            } else { // KALO GADA
                // KASIH STRING 0
                this.element.querySelector(".pengikut").innerHTML = `${this.selang.pengguna.pengikut}:0`;
            }
        })
    }

    follow(uid) {
        // PUSH KEY ID KITA DI DALAM FOLDER FOLLOWER PENGGUNA TERSEBUT
        this.following.set({follow: "done"});
        // KASIH KEY ID PENGGUNA TERSEBUT DI DALAM FOLDER FOLLOWING  KITA
        rdb.ref("users/"+auth.currentUser.uid+"/following").child(uid).set({follow: "done"});
        // UPDATE JUMLAH FOLLOWER
        this.getUser();
    }
    
    unfollow(uid) {
        // HAPUS KEY ID KITA DARI DALAM FOLDER FOLLOWER PENGGUNA TERSEBUT
        this.following.remove();
        // HAPUS KEY ID PENGGUNA TERSEBUT DARI DALAM FOLDER FOLLOWING  KITA
        rdb.ref("users/"+auth.currentUser.uid+"/following").child(uid).remove();
        // UPDATE JUMLAH FOLLOWER
        this.getUser();
    }

    detectLastActivity() {
        // DETEKSI LAST ACTIVITY
        new Dashboard().detectLastActivity();
    }

    openChat(uid, nama, foto) {
        // TUTUP ELEMENT INI
        this.element.remove();
        // JALANKAN INSTANCE PESANNYA
        this.pesan = new Pesan({
            uid: uid,
            nama: nama,
            foto: foto
        });
        // SISIPKAN CONTAINER KE DALAM INIT -- PARAMETER --
        this.pesan.init(document.querySelector(".container"));
    }

    init(container) {
        new Landing().end();
        this.createElement();
        container.appendChild(this.element);
        this.getUser();
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/