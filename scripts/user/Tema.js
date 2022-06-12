class Tema {
    constructor(tema) {
        this.tema = tema; // INI DARI USERSTATE (LIHAT DASHBOARD.JS)
    }
    createElement(container) {
        // DIV BARU
        this.element = document.createElement("div");
        this.element.classList.add("GantiTema");
        this.gelapTerang(this.tema, container); // LANGSUNG JALANKAN
    }

    gelapTerang(tema, container) {
        if(tema == "dark") { // KALO TEMA TERAKHIR ADALAH GELAP
            this.element.innerHTML = (`<i class="fa-duotone fa-sun-bright"></i>`); // KASIH SIMBOL MATAHARI
            this.element.setAttribute("data-tema", "light"); // GANTI ATRIBUT DATA TEMA (NYOCOKIN CSS DOANG)
            this.loadElement(container, tema); // JALANKAN LANGSUNG
        } else { // KALO TEMA TERAKHIR ADALAH CERAH
            this.element.innerHTML = (`<i class="fa-duotone fa-moon-stars"></i>`); // KASIH SIMBOL BULAN
            this.element.setAttribute("data-tema", "dark"); // GANTI ATRIBUT DATA TEMA (NYOCOKIN CSS DOANG)
            this.loadElement(container, tema); // JALANKAN LANGSUNG
        }
    }

    loadElement(container, tema) {
        container.appendChild(this.element); // MUNCULIN DIV TRANSISI KE MODE TERBARU
        if(tema == "dark") { // KALO TEMA TERBARU ADALAH GELAP
            setTimeout(() => {
                document.querySelector("body").classList.add("light"); // TAMBAHIN CLASS BARU = LIGHT
                this.element.classList.add("fade"); // KASIH CLASS FADE BUAT TRANSISI DI CSSNYA
            }, 1500);
        } else { // KALO TEMA TERBARU ADALAH TERANG
            setTimeout(() => {
                try { // COBA SURUH HAPUS CLASSNYA KALO ADA
                    /* Note:
                        1. Jika pengguna bermain tema (gelap, cerah, gelap cerah):
                            - Pasti ada classnya
                        2. Jika pengguna reload, dan dari local storage adalah cerah
                            - Tidak ada classnya dan pasti akan terjadi error
                            - Jadi akan kita catch dan tidak melakukan apa-apa
                    */
                    document.querySelector("body").removeAttribute("class")
                } catch {//
                }
                this.element.classList.add("fade"); // KASIH CLASS FADE BUAT TRANSISI DI CSSNYA
            }, 1500);
        }
        setTimeout(() => this.removeElement(), 2500); // JALANKAN SETELAH SEMUA TRANSISI SELESAI
    }

    removeElement() {
        this.element.remove(); // HAPUS ELEMENTNYA
    }
    init(container) {
        // OTOMATIS JALANKAN SETELAH DIPANGGIL
        this.createElement(container);
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/