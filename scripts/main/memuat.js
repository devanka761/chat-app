class Memuat {
    constructor(container) {
        this.container = container;
    }
    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Memuat");
        this.element.innerHTML = (`
            <span>SEDANG MEMUAT HALAMAN</span>
        `);
    }
    end() {
        const element = document.querySelector(".container .Memuat");
        element.remove();
    }
    init() {
        this.createElement();
        this.container.appendChild(this.element);
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/