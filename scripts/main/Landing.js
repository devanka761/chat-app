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