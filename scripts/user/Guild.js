class Guild {
    constructor(uid, nama, foto, member, owner) {
        this.selang = window.Bahasa[userState.last_lang]; // IMPORT DARI BAHASA
        this.uid = uid; // KEY GUILD
        this.nama = nama; // NAMA GUILD
        this.foto = foto; // FOTO GUILD
        this.owner = owner; // ID OWNER
        this.member = member; // JUMLAH MEMBER
    }

    createElement() {
        // DIV BARU UNTUK GUILD (COPAS DARI PROFIL)
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
                    Loading
                </div>
                <div class="follower">
                    <div class="pengikut">
                    </div>
                </div>
                <div class="tombolan">
                    <button class="btn-1 done clean">${this.selang.guild.tombolTutup}</button>
                    <button class="btn-1 chat hijau">${this.selang.guild.tombolChat}</button>
                </div>
                <button class="btn-1 leave merah">${this.selang.guild.tombolKeluar}</button>
            </div>
        `);
    }

    getGuild() {
        // KONTEN DI GUILD
        this.element.querySelector(".tentang .nama").innerText = this.nama;
        this.element.querySelector(".tentang .foto").style.backgroundImage = `url(${this.foto})`;
        this.element.querySelector(".tentang .bio").innerText = `ID: ${this.uid}`;
        this.element.querySelector(".tentang .pengikut").innerText = `${this.member} ${this.selang.guild.anggota}`;
        // LISTENER KETIKA TOMBOL CHAT DIKLIK
        this.element.querySelector(".tentang .tombolan .chat").onclick = () => {
            // MEMBUKA ROOM CHAT GRUP
            new Grup({
                uid: this.uid,
                nama: this.nama,
                foto: this.foto,
                member: this.member,
                owner: this.owner
            }).init(document.querySelector(".container"))
        };
        // LISTENER TOMBOL LEAVE DIKLIK
        this.element.querySelector(".leave").onclick = () => {
            // KONFIRMASI KLIK
            Notipin.Confirm({
                msg: `${this.selang.guild.notipinKeluar} "${this.nama}"?`,
                onYes: () => this.keluarHapus(this.owner),
                type: "danger",
                mode: "dark"
            })
        }
        // LISTENER TOMBOL TUTUP DIKLIK
        this.element.querySelector(".clean").onclick = () => new Dashboard().detectLastActivity();

        if(auth.currentUser.uid == this.owner) {
            // KALO USER ADALAH OWNER, MAKA ADA LISTENER UNTUK GANTI PROFIL GUILD
            this.element.querySelector(".tentang .foto").style.cursor = "pointer";
            this.element.querySelector(".tentang .foto").onclick = () => this.ngeditFoto();
        }
    }

    async keluarHapus(owner) {
        if(auth.currentUser.uid == owner) { // JIKA USER ADALAH OWNER
            // PASTIKAN KE FOLDER MEMBER DULU
            await rdb.ref("grup/" + this.uid + "/members/").once("value", akun => {
                akun.forEach(data => { // HAPUS KEY GUILDNYA DARI MASING-MASING MEMBER
                    rdb.ref("users/" + data.key + "/grup").child(this.uid).remove();
                })
            });
            // TEMUKAN FOLDER GUILDNYA
            await rdb.ref("grup/" + this.uid).once("value", data => {
                // HAPUS FOTO PROFIL DI STORAGE KALO ADA
                if(data.val().foto) { stg.ref(`grup/${this.uid}/profil.jpg`).delete() };
            })
            rdb.ref("grup/" + this.uid).remove(); // HAPUS FOLDERNYA
            new ListGrup().init(document.querySelector(".container")); // KEMBALIKAN USER KE ROOM LIST GRUP
        } else { // JIKA USER ADALAH MEMBER
            // HAPUS KEY USER TERSEBUT SAJA DI GUILD
            rdb.ref("users/"+auth.currentUser.uid+"/grup").child(this.uid).remove();
            // HAPUS GUILDNYA JUGA DARI DATA USERNYA
            rdb.ref("grup/" + this.uid + "/members/" + auth.currentUser.uid).remove();
            new ListGrup().init(document.querySelector(".container")); // KEMBALIKAN USER KE ROOM LIST GRUP
        }
    }

    ngeditFoto() {
        // BIKIN DIV INPUT
        this.inputFoto = document.createElement("input");
        // TIPENYA FILE
        this.inputFoto.setAttribute("type", "file");
        // BIKIN TIPE FILE KHUSUS GAMBAR
        this.inputFoto.setAttribute("accept", "image/*");
        // AUTO KLIK INPUT FILENYA
        this.inputFoto.click();
        // KALO UDAH DIPILIH GAMBARNYA, LAKUKAN submitFoto();
        this.inputFoto.onchange = () => this.submitFoto();
    }

    submitFoto() {
        const file = this.inputFoto.files[0]; // FILE YG DIPILIH
        if (!file.type.match('image/*')) return Notipin.Alert({
            // KALO YANG DIPILIH BUKAN FILE GAMBAR, MAKA KASIH ALERT DAN STOP SCRIPTNYA
            msg: `${this.selang.guild.notipinTipeGambar}`,
            mode: "dark"
        });
        // FOLDER FOTO PROFIL GUILD
        const fotoRef = stg.ref(`grup/${this.uid}/profil.jpg`);
        // UPLOAD FOTO
        const fotoUp = fotoRef.put(file);
        // KASIH DIV LOADING + ANIMASINYA
        const loader = document.createElement("div");
        loader.classList.add("loading");
        loader.innerHTML = (`<i class="fa-duotone fa-spinner"></i>`);
        this.element.querySelector(".foto").prepend(loader);
        // PROSES UPLOAD
        fotoUp.on("state_changed", () => {
            // AWALNYA MAU DIBIKIN PROGRESS BAR, TAPI MALESSS
        }, err => {alert(err)}, () => {
            // KALO BERHASIL TERUPLOAD, MAKA DAPATKAN LINK FOTONYA
            fotoUp.snapshot.ref.getDownloadURL().then(imgURL => {
                // PUSH LINKNYA KE FOLDER GUILD
                rdb.ref("grup/" + this.uid).update({
                    foto: imgURL
                })
                // GANTI FOTO GUILDNYA
                this.element.querySelector(".tentang .foto").style.backgroundImage = `url(${imgURL})`;
            }).then(() => { // KALO UDAH SELESAI SEMUA PROSES
                this.inputFoto.remove(); // HAPUS INPUT FILENYA
                loader.remove(); // HAPUS LOADINGNYA
                return;
            })
        })
    }

    init(container) {
        // OTOMATIS DIJALANKAN SETELAH DIPANGGIL
        new Landing().end();
        this.createElement();
        container.appendChild(this.element);
        this.getGuild();
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/