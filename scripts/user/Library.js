class Library {
    createElement() {
        // DIV BARU BUAT LIBRARY DOANG
        this.element = document.createElement("div");
        this.element.classList.add("Library");
        this.element.innerHTML = (`
            <button class="back">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div class="card link-fa">
                <h3 class="title">FONT AWESOME PRO v6.1.1</h3>
                <p class="desc">Salinan Font Awesome Pro (Stylesheet || Script)</p>
                <span>Link: <a href="https://devanka761.github.io/font-awesome-pro/" target="_blank">https://devanka761.github.io/font-awesome-pro/</a></span>
            </div>
            <div class="card link-notipin">
                <h3 class="title">NOTIPIN</h3>
                <p class="desc">Interaksi && Alert || Confirm || Prompt</p>
                <span>Link: <a href="https://github.com/devanka761/notipin" target="_blank">https://github.com/devanka761/notipin</a></span>
            </div>
        `);
    }
    clicked() { // U KNOW LAH
        const back = this.element.querySelector("button.back");
        const fa = this.element.querySelector(".card.link-fa");
        const notipin = this.element.querySelector(".card.link-notipin");

        back.onclick = () => new Dashboard().detectLastActivity();
        fa.onclick = () => window.open("https://devanka761.github.io/font-awesome-pro/");
        notipin.onclick = () => window.open("https://github.com/devanka761/notipin");
    }
    init(container) { // OTOMATIS JALANKAN SETELAH DIPANGGIL
        new Landing().end();
        this.createElement();
        container.appendChild(this.element);
        this.clicked();
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/