class Landing {
    constructor() {
        // AMBIL CLASS CONTAINER DARI HTML
        this.container = document.querySelector(".container");
    }

    createElement() {
        // BIKIN DIV BARU DENGAN CLASS "LANDING"
        this.element = document.createElement("div");
        this.element.classList.add("Landing");
        // ISI DARI "LANDING"
        this.element.innerHTML = (`
            <div class="Title">KIRIMIN</div>
            <div class="Desc">Login dulu ya untuk melanjutkan</div>
            <div class="Tombol">
                <button class="btn-1 chooseEmail"><i class="far fa-envelope"></i>Email</button>
                <button class="btn-1 loginGoogle"><i class="fab fa-google"></i>Google</button>
            </div>
        `);
        
        this.googleLogin = this.element.querySelector(".loginGoogle");
        this.googleLogin.onclick = () => {
            const provider = new firebase.auth.GoogleAuthProvider()
        
            userState.changeLast("first");
            new Activity().save();
            // LOGIN DENGAN POPUP  -- KALO REDIRECT PAKE: signInWithRedirect() --
            auth.signInWithPopup(provider);
        }
        // LISTENER KALO KLIK LOGIN EMAIL
        this.chooseEmail = this.element.querySelector(".chooseEmail");
        this.chooseEmail.onclick = () => this.emailElement(this.element);
    }

    emailElement(chooser) {
        // DIV BARU
        this.mailElement = document.createElement("div");
        this.mailElement.classList.add("Landing");
        this.mailElement.innerHTML = (`
            <div class="Title">KIRIMIN</div>
            <div class="Desc">Login Email</div>
            <div class="Tombol">
                <input type="text" placeholder="Email" data-inpt="email" required />
                <input type="text" placeholder="Password" data-inpt="password" required />
                <button class="btn-1 loginEmail">Login</button>
            </div>
            <div class="reg">
                Belum Punya Akun? <span>Buat Sekarang</span>
            </div>
        `);
        const email = this.mailElement.querySelector(`.Tombol [data-inpt="email"]`);
        const password = this.mailElement.querySelector(`.Tombol [data-inpt="password"]`);

        this.mailElement.querySelector(".reg span").onclick = () => this.registerElement(this.mailElement); // LISTENER KALO KLIK BUAT AKUN
        this.mailElement.querySelector('.loginEmail').onclick = () => this.login(email, password); // LISTENER KALO KLIK LOGIN
        chooser.remove(); // HAPUS ELEMENT SEBELUMNYA
        this.container.appendChild(this.mailElement); // MASUKIN KE CONTAINER
    }

    login(email, password) {
        // LOGIN HANDLER DENGAN EMAIL DAN PASSWORD
        auth.signInWithEmailAndPassword(email.value, password.value).catch((err) => Notipin.Alert({
            msg: err.message,
            mode: "dark"
        })); // KALO ADA ERROR TAMPILKAN DI ALERT
    }

    registerElement(loginElement) {
        // DIV BARU
        this.regElement = document.createElement("div");
        this.regElement.classList.add("Landing");
        this.regElement.innerHTML = (`
            <div class="Title">KIRIMIN</div>
            <div class="Desc">Login Email</div>
            <div class="Tombol">
                <input type="text" placeholder="Email" data-inpt="email" required />
                <input type="text" placeholder="Password" data-inpt="password" required />
                <input type="text" placeholder="Konfirmasi Password" data-inpt="cPassword" required />
                <button class="btn-1 registerEmail">Register</button>
            </div>
            <div class="reg">
                Sudah Punya Akun? <span>Masuk Sekarang</span>
            </div>
        `);

        const email = this.regElement.querySelector(`.Tombol [data-inpt="email"]`);
        const password = this.regElement.querySelector(`.Tombol [data-inpt="password"]`);
        const cPassword = this.regElement.querySelector(`.Tombol [data-inpt="cPassword"]`);

        this.regElement.querySelector(".reg span").onclick = () => this.emailElement(this.regElement); // LISTENER KLIK MASUK AKUN
        this.regElement.querySelector(".registerEmail").onclick = () => this.register(email, password, cPassword); // LISTENER KLIK REGISTER
        loginElement.remove(); // HAPUS ELEMENT SEBELUMNYA
        this.container.appendChild(this.regElement); // MASUKKIN KE CONTAINER
    }

    register(email, password, cPassword) {
        if(email.value == '' || password.value == "" || cPassword.value == "") return Notipin.Alert({
            msg: "Harap Isi Semua Bidang",
            type: "danger",
            mode: "dark"
        }); // KALO ADA SALAH SATU YANG KOSONG AKAN ADA ALERT
        if(password.value.length < 8) return Notipin.Alert({
            msg: "Password Minimal 8 Karakter",
            type: "danger",
            mode: "dark"
        }); // KALO PASSWORD KURANG DARI 8 KARAKTER AKAN ADA ALERT
        if(password.value !== cPassword.value) return Notipin.Alert({
            msg: "Konfirmasi Password Tidak Sesuai",
            type: "danger",
            mode: "dark"
        }); // KALO KONFIRMASI PASSWORD TIDAK SESUAI(MATCH) MAKA ADA ALERT
        auth.createUserWithEmailAndPassword(email.value, cPassword.value).catch((err) => Notipin.Alert({
            msg: err.message,
            mode: "dark"
        })); // KALO ADA ERROR, TAMPILKAN DI ALERT
    }

    end() {
        const header = this.container.querySelector(".header");
        const navbar = this.container.querySelector(".navbar");
        const profil = this.container.querySelector(".Profil");
        const chat = this.container.querySelector(".Chat");
        const ngechat = document.getElementById("chatting");
        const listchat = this.container.querySelector(".ListChat");
        const listpost = this.container.querySelector(".ListPost");
        const library = this.container.querySelector(".Library");
        // HAPUS JIKA ADA ELEMENT
        if (this.element) { this.element.remove() };
        if (header) { header.remove() };
        if (navbar) { navbar.remove() };
        if (profil) { profil.remove() };
        if (chat) { chat.remove() };
        if (listchat) { listchat.remove();
        new ListPesan().close(); };
        if (listpost) { listpost.remove() };
        if (library) { library.remove() };
        if (new Dashboard().opsi === true) new Dashboard().opsi = false;
    }

    init() {
        /*

        INIT AKAN KITA PANGGIL SEPANJANG WAKTU,
        SEMOGA TIDAK BOSAN YA.. HAHAHA
        
        */

        // BERSIHKAN TERLEBIH DAHULU SEMUANYA
        this.end();
        // PERINTAHKAN UNTUK BIKIN DIV BARU
        this.createElement();
        // SURUH DIV TERSEBUT MASUK DI DALAM ELEMENT CONTAINER
        this.container.appendChild(this.element);
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/