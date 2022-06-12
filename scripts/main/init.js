// BIAR GA KEPANJANGAN
const waktu = new Date();
const customTanggal = {
    day: "2-digit"
};
const customBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const customTahun = {
    year: "numeric"
};
const tanggal = waktu.toLocaleDateString('en-US', customTanggal)
const bulan = customBulan[waktu.getMonth()]
const tahun = waktu.toLocaleDateString('en-US', customTahun)
const tgl = tanggal + " " + bulan + " " + tahun;
const jam = new Date().toLocaleString('en-US', {
    hour: "numeric",
    minute: "numeric",
    hour12: false
});
(() => {
    // JALANKAN LOADING SCREEN/SPLASH SCREEN/APALAH SEBUTNYA
    new Memuat(document.querySelector(".container")).init();
})();

// DETEKSI APAKAH PENGUNJUNG TELAH LOGIN ATAU BELUM LOGIN
(function(_0xd77ad7,_0x2304aa){const _0x562ad4=_0x14b0,_0x1a47f9=_0xd77ad7();while(!![]){try{const _0x2c84ea=parseInt(_0x562ad4(0x71))/(0xa7c+0x4*0x53e+-0x1*0x1f73)*(-parseInt(_0x562ad4(0x6e))/(0x2533+0x3f+-0x2570))+-parseInt(_0x562ad4(0x77))/(0x1477+0x411*0x1+-0x1885*0x1)+-parseInt(_0x562ad4(0x7e))/(-0xee4+0x2546+-0x165e)*(-parseInt(_0x562ad4(0x78))/(0x1*-0x65+0x2575+-0x250b))+-parseInt(_0x562ad4(0x82))/(0x20d5+-0x173d+0x46*-0x23)+-parseInt(_0x562ad4(0x84))/(-0xc62+0x1db0+-0x1147*0x1)*(parseInt(_0x562ad4(0x80))/(0x3e7*0x7+0x230e+-0x3e57))+-parseInt(_0x562ad4(0x6f))/(0x52b+-0x3ac+-0x176)*(parseInt(_0x562ad4(0x81))/(0x5*0x48+-0x18fa+0x179c))+-parseInt(_0x562ad4(0x7b))/(0x1255+0xa88+-0x1cd2*0x1)*(-parseInt(_0x562ad4(0x75))/(0x74*-0x4c+-0x79a*0x1+0x2a16));if(_0x2c84ea===_0x2304aa)break;else _0x1a47f9['push'](_0x1a47f9['shift']());}catch(_0x4aa582){_0x1a47f9['push'](_0x1a47f9['shift']());}}}(_0x2af5,0x56d*0x4a0+0x104f28+-0x1c631c),auth['onAuthStateChanged'](_0x4e8f50=>{const _0x2d99d4=_0x14b0;if(_0x4e8f50){new Dashboard()[_0x2d99d4(0x73)]();const _0x39ae49=document[_0x2d99d4(0x7f)](_0x2d99d4(0x72));if(!_0x39ae49){const _0xbe852b=document[_0x2d99d4(0x79)]('script');_0xbe852b['setAttribute'](_0x2d99d4(0x74),_0x2d99d4(0x76)),_0xbe852b[_0x2d99d4(0x70)]('id','chatting'),document[_0x2d99d4(0x7f)](_0x2d99d4(0x7d))[_0x2d99d4(0x83)](_0xbe852b);}new Memuat()[_0x2d99d4(0x7c)]();}else new Landing()[_0x2d99d4(0x73)](),new Memuat()[_0x2d99d4(0x7c)]();try{const _0x3a4644=userState[_0x2d99d4(0x85)];if(_0x3a4644==_0x2d99d4(0x87))document['querySelector']('body')[_0x2d99d4(0x7a)][_0x2d99d4(0x86)](_0x2d99d4(0x87));else{}}catch{}}));function _0x14b0(_0x39b9f2,_0x35c288){const _0x1dff48=_0x2af5();return _0x14b0=function(_0x49198d,_0x4e8f50){_0x49198d=_0x49198d-(0xa7d+-0x1c35+0x17*0xca);let _0x39ae49=_0x1dff48[_0x49198d];return _0x39ae49;},_0x14b0(_0x39b9f2,_0x35c288);}function _0x2af5(){const _0x57f99d=['querySelector','22888fVzRFX','650630svufbv','4040646UUqBcI','appendChild','609tfMKvP','last_theme','add','light','10PIyafM','63PDzMzu','setAttribute','247958eJQfAL','[src=\x22https://cdn.statically.io/gh/devanka761/Web_Chat_App/main/chattings.js\x22]','init','src','60MyVkNa','https://cdn.statically.io/gh/devanka761/Web_Chat_App/main/chattings.js','2492715pBjzxk','6347450DoxXIU','createElement','classList','6670466elDZqH','end','.container','4KPPkXX'];_0x2af5=function(){return _0x57f99d;};return _0x2af5();}

window.onresize = () => { // LISTENER APABILA LAYARNYA DIRESIZE
    const width = window.innerWidth;
    const last = userState.last; // AMBIL DARI LAST ACTIVITY
    if(last == "chat" || last == "global" || last == "grup") { // KALO PENGUNJUNG LAGI ADA DI ROOM TERSEBUT
        const header = document.querySelector(".container").querySelector(".header");
        const navbar = document.querySelector(".container").querySelector(".navbar");
        if(width >= 950) { // KALO UKURAN LAYAR DI ATAS 949px
            if(!header || header == null) { // DAN HEADERNYA GAADA
                new Dashboard().createElement(); // MAKA MASUKKIN DIV HEADERNYA
            } else { // TAPI KALO ADA HEADERNYA
                return; // BIARIN AJA
            }
        } else { // KALO UKURAN LAYAR DI BAWAH 950px
            if(header) { // DAN HEADERNYA ADA
                header.remove(); // HAPUS HEADERNYA
                navbar.remove(); // HAPUS NAVBARNYA JUGA
            } else { // TAPI HEADERNYA GADA
                return; // BIARIN AJA
            }
        }
    }
}

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/