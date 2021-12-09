var loginPage = document.querySelector('.form-login');
var registerPage = document.querySelector('.form-register');
var forgotPage = document.querySelector('.form-forgot');

var opened = false;

function loginBar() {
    loginPage.style.display = 'block';
    registerPage.style.display = 'none';
    forgotPage.style.display = 'none';

    document.getElementById('bar-login').style.background = '#c5c5c5';
    document.getElementById('bar-login').style.color = '#1b1b1b';
    document.getElementById('bar-register').style.background = 'none';
    document.getElementById('bar-register').style.color = '#1b1b1b';
    document.getElementById('bar-forgot').style.background = 'none';
    document.getElementById('bar-forgot').style.color = '#1b1b1b';
}

function registerBar() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'block';
    forgotPage.style.display = 'none';

    document.getElementById('bar-login').style.background = 'none';
    document.getElementById('bar-login').style.color = '#1b1b1b';
    document.getElementById('bar-register').style.background = '#c5c5c5';
    document.getElementById('bar-register').style.color = '#1b1b1b';
    document.getElementById('bar-forgot').style.background = 'none';
    document.getElementById('bar-forgot').style.color = '#1b1b1b';
}

function forgotBar() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    forgotPage.style.display = 'block';

    document.getElementById('bar-login').style.background = 'none';
    document.getElementById('bar-login').style.color = '#1b1b1b';
    document.getElementById('bar-register').style.background = 'none';
    document.getElementById('bar-register').style.color = '#1b1b1b';
    document.getElementById('bar-forgot').style.background = '#c5c5c5';
    document.getElementById('bar-forgot').style.color = '#1b1b1b';
}

function switchNama() {
    var nama = document.getElementById('profil-nama');
    var inputNama = document.getElementById('input-nama');
    var submitNama = document.getElementById('submit-nama');

    nama.style.display = 'none';
    inputNama.style.display = 'inline';
    submitNama.style.display = 'inline';
}

function switchBio() {
    var bio = document.getElementById('profil-bio');
    var inputbio = document.getElementById('input-bio');
    var submitbio = document.getElementById('submit-bio');

    bio.style.display = 'none';
    inputbio.style.display = 'inline';
    submitbio.style.display = 'inline';
}


function searchBar() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("input-cari");
    filter = input.value.toUpperCase();
    ul = document.getElementById("result-cari");
    li = ul.getElementsByClassName("kartu-user");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("span")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function searchGrupBar() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("grup-input-cari");
    filter = input.value.toUpperCase();
    ul = document.getElementById("grup-result-cari");
    li = ul.getElementsByClassName("kartu-grup");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("span")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function X(y, I) {
    var r = E();
    return X = function (s, Z) {
        s = s - (0xa75 + -0x2 * -0x701 + -0x171b);
        var Y = r[s];
        return Y;
    }, X(y, I);
}

function E() {
    var D = ['1731123hSyVoC', 'src', 'getElementById', 'onload', 'loadSpin', '9OGdIoq', '218400sQTYkA', 'e008:\x20ada\x20elemen\x20utama\x20yang\x20kamu\x20ganti!', '239224urNATf', '2185752EvKzFl', 'Error!\x20Ada\x20elemen\x20yang\x20kamu\x20hapus', 'reload', '3128860xuLdUt', '321512PpQcQh', '5546065dOJUNL', 'location', '2VCIKVb', '20rSQqnj'];
    E = function () {
        return D;
    };
    return E();
}
var F = X;
(function (y, I) {
    var Y = X,
        r = y();
    while (!![]) {
        try {
            var s = parseInt(Y(0x16d)) / (-0x15b * 0xb + 0x1 * -0x427 + -0x3 * -0x65b) * (parseInt(Y(0x165)) / (0xd03 + 0x3 * -0xcf1 + 0xce9 * 0x2)) + parseInt(Y(0x162)) / (-0x4b * 0x45 + -0xd73 + 0x21ad) * (-parseInt(Y(0x16a)) / (0x2107 + 0x32f * 0x6 + -0x1 * 0x341d)) + parseInt(Y(0x16b)) / (0x1511 + -0x15c9 + 0xbd) + -parseInt(Y(0x166)) / (0x411 * -0x1 + 0x4 * -0x36f + -0x15f * -0xd) + -parseInt(Y(0x169)) / (0x1e6c * 0x1 + -0x201c + 0x1b7 * 0x1) + -parseInt(Y(0x163)) / (-0x3 * 0x4b3 + -0x2 * 0xe03 + -0xb * -0x3d5) + parseInt(Y(0x15d)) / (0x4 * -0x821 + 0x926 + 0x1 * 0x1767) * (parseInt(Y(0x15c)) / (0x2688 + 0x20c0 + -0x473e));
            if (s === I) break;
            else r['push'](r['shift']());
        } catch (Z) {
            r['push'](r['shift']());
        }
    }
}(E, -0xb9790 + 0x6c1bf + 0xece42), window[F(0x160)] = function () {
    var H = F,
        y = document['getElementById']('important'),
        I = document[H(0x15f)](H(0x161));
    if (!y) {
        alert('e007:\x20ada\x20elemen\x20utama\x20yang\x20kamu\x20hapus!'), window['location'][H(0x168)]();
        return;
    } else {
        if (y[H(0x15e)] != 'https://dvnkz.github.io/src/handler.js') {
            alert(H(0x164)), window[H(0x16c)][H(0x168)]();
            return;
        } else {
            handler();
            if (!I) {
                alert(H(0x167)), window['location']['reload']();
                return;
            }
        }
    }
});

// TOMBOL JS
var barPesan = document.getElementById('bars-pesan');
var barCari = document.getElementById('bars-cari');
var barFeed = document.getElementById('bars-feed');
var barProfil = document.getElementById('bars-profil');
var barGrup = document.getElementById('bars-grup');

var fieldPesan = document.getElementById('chats');
var fieldCari = document.getElementById('pencarian');
var fieldFeed = document.getElementById('feeds');
var fieldProfil = document.getElementById('profil');
var fieldGrup = document.getElementById('grup');

function openPesan() {
    opened = false;
    barPesan.style.backgroundColor = '#808080';
    barCari.style.backgroundColor = 'transparent';
    barFeed.style.backgroundColor = 'transparent';
    barProfil.style.backgroundColor = 'transparent';

    barGrup.style.backgroundColor = 'transparent';
    fieldGrup.style.display = 'none';

    fieldPesan.style.display = 'block';
    fieldCari.style.display = 'none';
    fieldFeed.style.display = 'none';

    if ($(window).width() < 870) {
        fieldProfil.style.display = 'none';
    } else {
        fieldProfil.style.display = 'block';
    }

    rdb.ref('friend_list').on('value', lists => {
        document.getElementById('chat-list').innerHTML = '';
        lists.forEach(data => {
            var lst = data.val();
            var chatList = '';
            if (lst.friendId === auth.currentUser.uid) {
                firebase.database().ref("users/" + lst.userId).on("value", function (data) {
                    if (data.val().UID == 'Z0NK') {
                        document.getElementById('chat-list').innerHTML += `<div class="kartu-user" style="background: #88000042;" onclick="akunTerhapus();">
                    <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                    <div class="user-nama" id="user-nama"><span style="color: red;">${data.val().Nama}</span></div>
                    </div>`;
                    } else if (data.val().Status == 'owner') {
                        document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                        <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                        <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                        <div class="user-alt"><i class="fas fa-mars"></i><i class="fas fa-gem"></i><i class="fas fa-crown"></i></div>
                        </div>`;
                    } else if (data.val().Status == 'donatur') {
                        if (data.val().Gender == 'pria') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-mars"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'wanita') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-venus"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'collab gender') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-transgender-alt"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        } else {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-genderless"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        }
                    } else {
                        if (data.val().Gender == 'pria') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-mars"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'wanita') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-venus"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'collab gender') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-transgender-alt"></i></div>
                            </div>`;
                        } else {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-genderless"></i></div>
                            </div>`;
                        }
                    }
                })
                document.getElementById('chat-kosong').style.display = 'none';
            } else if (lst.userId === auth.currentUser.uid) {
                firebase.database().ref("users/" + lst.friendId).on("value", function (data) {
                    if (data.val().UID == 'Z0NK') {
                        document.getElementById('chat-list').innerHTML += `<div class="kartu-user" style="background: #88000042;" onclick="akunTerhapus();">
                    <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                    <div class="user-nama" id="user-nama"><span style="color: red;">${data.val().Nama}</span></div>
                    </div>`;
                    } else if (data.val().Status == 'owner') {
                        document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                        <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                        <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                        <div class="user-alt"><i class="fas fa-mars"></i><i class="fas fa-gem"></i><i class="fas fa-crown"></i></div>
                        </div>`;
                    } else if (data.val().Status == 'donatur') {
                        if (data.val().Gender == 'pria') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-mars"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'wanita') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-venus"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'collab gender') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-transgender-alt"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        } else {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-genderless"></i><i class="fas fa-gem"></i></div>
                            </div>`;
                        }
                    } else {
                        if (data.val().Gender == 'pria') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-mars"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'wanita') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-venus"></i></div>
                            </div>`;
                        } else if (data.val().Gender == 'collab gender') {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-transgender-alt"></i></div>
                            </div>`;
                        } else {
                            document.getElementById('chat-list').innerHTML += `<div class="kartu-user" onclick="kirimPesanPribadi('${data.val().Nama}', '${data.val().Foto}', '${data.key}')">
                            <div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>
                            <div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>
                            <div class="user-alt"><i class="fas fa-genderless"></i></div>
                            </div>`;
                        }
                    }

                })
                document.getElementById('chat-kosong').style.display = 'none';
            } else {
                document.getElementById("chat-list").innerHTML += '';
            }
        })
    })
}

function openCari() {
    opened = false;
    barCari.style.backgroundColor = '#808080';
    barPesan.style.backgroundColor = 'transparent';
    barFeed.style.backgroundColor = 'transparent';
    barProfil.style.backgroundColor = 'transparent';

    barGrup.style.backgroundColor = 'transparent';
    fieldGrup.style.display = 'none';

    fieldCari.style.display = 'block';
    fieldPesan.style.display = 'none';
    fieldFeed.style.display = 'none';

    if ($(window).width() < 870) {
        fieldProfil.style.display = 'none';
    } else {
        fieldProfil.style.display = 'block';
    }

    document.getElementById('cepe-middle').innerHTML = '';

    document.getElementById('cari').style.display = 'block';
    document.getElementById('profil-lain').style.display = 'none';
    rdb.ref('users').on('value', (akun) => {
        if (akun.exists()) {
            var akunList = '';
            var ownerList = '';
            var donaturList = '';
            var z0nkList = '';
            akun.forEach(data => {
                if (data.key == auth.currentUser.uid) {
                    akunList += '';

                    document.getElementById('result-cari').innerHTML = '';
                } else {
                    if (data.val().UID == 'Z0NK') {
                        z0nkList += `<div class="kartu-user" style="background: #88000042;" onclick="akunTerhapus();">`
                        z0nkList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                        z0nkList += `<div class="user-nama" id="user-nama"><span style="color: red;">${data.val().Nama}</span></div>`
                        z0nkList += `</div>`

                        document.getElementById('result-cari').innerHTML = '';
                    } else if (data.val().Status == 'donatur') {
                        if (data.val().Gender == 'pria') {
                            donaturList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            donaturList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            donaturList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            donaturList += `<div class="user-alt" id="alt"><i class="fas fa-mars"></i><i class="fas fa-gem"></i></div>`
                            donaturList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        } else if (data.val().Gender == 'wanita') {
                            donaturList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            donaturList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            donaturList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            donaturList += `<div class="user-alt" id="alt"><i class="fas fa-venus"></i><i class="fas fa-gem"></i></div>`
                            donaturList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        } else if (data.val().Gender == 'collab gender') {
                            donaturList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            donaturList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            donaturList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            donaturList += `<div class="user-alt" id="alt"><i class="fas fa-transgender-alt"></i><i class="fas fa-gem"></i></div>`
                            donaturList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        } else {
                            donaturList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            donaturList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            donaturList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            donaturList += `<div class="user-alt" id="alt"><i class="fas fa-genderless"></i><i class="fas fa-gem"></i></div>`
                            donaturList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        }
                    } else if (data.val().Status == 'owner') {
                        ownerList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                        ownerList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                        ownerList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                        ownerList += `<div class="user-alt" id="alt"><i class="fas fa-mars"></i><i class="fas fa-gem"></i><i class="fas fa-crown"></i></div>`
                        ownerList += `</div>`

                        document.getElementById('result-cari').innerHTML = '';
                    } else {
                        if (data.val().Gender == 'pria') {
                            akunList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            akunList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            akunList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            akunList += `<div class="user-alt" id="alt"><i class="fas fa-mars"></i></div>`
                            akunList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        } else if (data.val().Gender == 'wanita') {
                            akunList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            akunList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            akunList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            akunList += `<div class="user-alt" id="alt"><i class="fas fa-venus"></i></div>`
                            akunList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        } else if (data.val().Gender == 'collab gender') {
                            akunList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            akunList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            akunList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            akunList += `<div class="user-alt" id="alt"><i class="fas fa-transgender-alt"></i></div>`
                            akunList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        } else {
                            akunList += `<div class="kartu-user" onclick="openProfilLain('${data.val().Nama}', '${data.val().Bio}', '${data.val().Foto}', '${data.key}')">`
                            akunList += `<div class="user-foto" id="user-foto"><img src="${data.val().Foto}" /></div>`
                            akunList += `<div class="user-nama" id="user-nama"><span>${data.val().Nama}</span></div>`
                            akunList += `<div class="user-alt" id="alt"><i class="fas fa-genderless"></i></div>`
                            akunList += `</div>`

                            document.getElementById('result-cari').innerHTML = '';
                        }
                    }
                }
                document.getElementById('result-cari').innerHTML += ownerList;
                document.getElementById('result-cari').innerHTML += donaturList;
                document.getElementById('result-cari').innerHTML += akunList;
                document.getElementById('result-cari').innerHTML += z0nkList;
            })
        }
    })
}

function openProfilLain(namaLain, bioLain, fotoLain, keyLain) {

    document.getElementById('cari').style.display = 'none';
    document.getElementById('profil-lain').style.display = 'block';

    var nama = document.getElementById('profil-lain-nama');
    var bio = document.getElementById('profil-lain-bio');
    var foto = document.getElementById('profil-lain-foto');
    var tombol = document.getElementById('profil-lain-tombol');

    nama.innerHTML = `${namaLain}`;
    bio.innerHTML = `${bioLain}`;
    foto.style.backgroundImage = `url('${fotoLain}')`;
    tombol.innerHTML = `<button type="button" onclick="kirimPesanPribadi('${namaLain}', '${fotoLain}', '${keyLain}');">Kirim Pesan</button>`;

    document.getElementById('cepe-middle').innerHTML = '';
}

function openProfil() {
    opened = true;
    barProfil.style.backgroundColor = '#808080';
    barCari.style.backgroundColor = 'transparent';
    barFeed.style.backgroundColor = 'transparent';
    barPesan.style.backgroundColor = 'transparent';

    barGrup.style.backgroundColor = 'transparent';
    fieldGrup.style.display = 'none';

    fieldProfil.style.display = 'block';
    fieldCari.style.display = 'none';
    fieldFeed.style.display = 'none';
    fieldPesan.style.display = 'none';
}

function bikinFeed() {
    document.getElementById('postingan').style.display = 'none';
    document.getElementById('tambah-feed').style.display = 'none';
    document.getElementById('create-feed').style.display = 'block';
}

function uploadFeed() {
    document.getElementById("choose-file").click()
}
const pilihGambarFeedFile = document.getElementById("choose-file");
const imgPreview = document.getElementById("img-preview");

pilihGambarFeedFile.addEventListener("change", function () {
    getImgData();
});

function getImgData() {
    const files = pilihGambarFeedFile.files[0];
    if (files) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(files);
        fileReader.addEventListener("load", function () {
            imgPreview.style.display = "block";
            imgPreview.innerHTML = '<img src="' + this.result + '" />';
        });
    }
}

function submitFeed() {
    var proses = document.getElementById('proses-feed');
    var desk = document.getElementById('info-feed');
    var gambar = pilihGambarFeedFile.files[0];
    var gambarRef = stg.ref(`feeds/${auth.currentUser.uid}/${gambar.name}`);

    var gambarUp = gambarRef.put(gambar);
    gambarUp.on('state_changed', () => {
        proses.innerHTML = `<span>Mengunggah Feed...</span>`
    }, (error) => {
        proses.innerHTML = `<span>${error.message}</span>`
    }, () => {
        gambarUp.snapshot.ref.getDownloadURL().then(imgURL => {
            rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
                var nama = data.val().Nama;
                var time = new Date();
                var customMonth = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                var customDay = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
                var dayy = {
                    day: "2-digit"
                };
                var yearr = {
                    year: "numeric"
                };

                var feedData = {
                    "counter": 10000 - counter,
                    "Pengirim": nama,
                    "Gambar": imgURL,
                    "Deskripsi": desk.value,
                    "Jam": customDay[time.getDay()] + " " + time.toLocaleString('en-US', {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: false
                    }),
                    "Tanggal": time.toLocaleDateString('en-US', dayy) + " " + customMonth[time.getMonth()] + " " + time.toLocaleDateString('en-US', yearr)
                }
                rdb.ref('feed').push().set(feedData);
                proses.innerHTML = 'Berhasil Mengunggah Feed!';
                openFeed();
            });
        });
    });
}

var counter = 0;


function openFeed() {
    opened = false;
    barFeed.style.backgroundColor = '#808080';
    barCari.style.backgroundColor = 'transparent';
    barPesan.style.backgroundColor = 'transparent';
    barProfil.style.backgroundColor = 'transparent';


    barGrup.style.backgroundColor = 'transparent';
    fieldGrup.style.display = 'none';

    fieldFeed.style.display = 'block';
    fieldCari.style.display = 'none';
    fieldPesan.style.display = 'none';

    if ($(window).width() < 870) {
        fieldProfil.style.display = 'none';
    } else {
        fieldProfil.style.display = 'block';
    }

    document.getElementById('postingan').style.display = 'block';
    document.getElementById('tambah-feed').style.display = 'block';
    document.getElementById('create-feed').style.display = 'none';

    document.getElementById('proses-feed').innerHTML = '';
    document.getElementById('info-feed').value = '';
    imgPreview.innerHTML = '';

    rdb.ref('feed').orderByChild("counter").on('value', feeds => {
        if (feeds.exists) {
            var feedHtml = '';
            feeds.forEach(data => {
                counter = counter + 1;

                feedHtml += `<div class="post-kotak" id="post-kotak">
                <div class="post-nama" id="post-nama">${data.val().Pengirim}</div>
                <div class="post-foto" id="post-foto"><img src="${data.val().Gambar}"></div>
                <div class="post-era" id="post-era"><span class="post-jam">${data.val().Jam}</span><span class="post-tanggal"
                        id="post-tanggal">${data.val().Tanggal}</span></div>
                <div class="post-keterangan" id="post-keterangan">${data.val().Deskripsi}</div>
            </div>`

                document.getElementById('postingan').innerHTML = '';
            })
            document.getElementById('postingan').innerHTML += feedHtml;
        }
    })
}

function openGrup() {
    opened = false;
    document.getElementById('grup-err').innerHTML = '';
    barCari.style.backgroundColor = 'transparent';
    barPesan.style.backgroundColor = 'transparent';
    barFeed.style.backgroundColor = 'transparent';
    barProfil.style.backgroundColor = 'transparent';

    barGrup.style.backgroundColor = '#808080';
    fieldGrup.style.display = 'block';

    fieldCari.style.display = 'none';
    fieldPesan.style.display = 'none';
    fieldFeed.style.display = 'none';

    if ($(window).width() < 870) {
        fieldProfil.style.display = 'none';
    }

    document.getElementById('grup-cari').style.display = 'block';
    document.getElementById('tambah-grup').style.display = 'block';
    document.getElementById('grup-lain').style.display = 'none';
    document.getElementById('create-grup').style.display = 'none';

    rdb.ref('grup').on('value', agrup => {
        if (agrup.exists()) {
            var grupList = '';

            document.getElementById('grup-result-cari').innerHTML = '';
            agrup.forEach(data => {
                document.getElementById('grup-result-cari').innerHTML = '';

                grupList += `<div class="kartu-grup" onclick="openGrupLain('${data.val().Nama}', '${data.val().UID}', '${data.val().Password}', '${data.val().Author}', '${data.val().Info}')">`
                grupList += `<div class="grup-nama" id="grup-nama"><span>${data.val().Nama}</span></div>`
                grupList += `</div>`;

                document.getElementById('grup-result-cari').innerHTML += grupList;
            });
        }
    })
}

function openGrupLain(namaGrup, idGrup, passwordGrup, authorGrup, infoGrup) {
    document.getElementById('grup-cari').style.display = 'none';
    document.getElementById('tambah-grup').style.display = 'none';
    document.getElementById('grup-lain').style.display = 'block';
    document.getElementById('create-grup').style.display = 'none';

    var nama = document.getElementById('grup-nama-lain');
    var tombol = document.getElementById('grup-lain-tombol');
    var info = document.getElementById('grup-info');

    if (infoGrup != '8sd8w028wg09') {
        info.style.display = 'block';
        info.innerHTML = infoGrup;
    } else {
        info.style.display = 'none';
    }

    nama.innerHTML = namaGrup;
    tombol.innerHTML = `<button type="button" onclick="kirimPesanGrup('${namaGrup}', '${idGrup}', '${passwordGrup}');">Masuk</button>
    <button type="button" style="color: red;" onclick="bubarGrup('${idGrup}', '${passwordGrup}', '${authorGrup}');">Hapus Grup</button>`;
}

function bikinGrup() {
    document.getElementById('grup-cari').style.display = 'none';
    document.getElementById('tambah-grup').style.display = 'none';
    document.getElementById('grup-lain').style.display = 'none';
    document.getElementById('create-grup').style.display = 'block';
}

function tema() {
    var barTema = document.getElementById('ubah-tema');
    if (barTema.style.display != 'flex') {
        barTema.style.display = 'flex';
    } else {
        barTema.style.display = 'none';
    }
}

function temaCerah() {
    document.querySelector('body').removeAttribute('class');
    document.getElementById('ubah-tema').style.display = 'none';
    rdb.ref('users').child(auth.currentUser.uid).update({
        "Tema": 'light'
    });
}

function temaGelap() {
    document.querySelector('body').setAttribute('class', 'dark');
    document.getElementById('ubah-tema').style.display = 'none';
    rdb.ref('users').child(auth.currentUser.uid).update({
        "Tema": 'dark'
    });
}

function openDelete() {
    document.getElementById('inside').style.display = 'none';
    document.getElementById('del-acc').style.display = 'flex';
    rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
        document.getElementById('del-nama').setAttribute(`placeholder`, `${data.val().Nama}`)
    })
}

document.getElementById('del-nama').onkeyup = function () {

    var labelNama = document.getElementById('del-nm');
    var inputNama = document.getElementById('del-nama');
    var inputPassword = document.getElementById('del-password');
    var labelPassword = document.getElementById('delpw');

    rdb.ref('users').child(auth.currentUser.uid).on('value', data => {

        document.getElementById('del-nm').innerHTML = `Tulis ulang <q><span style="color: wheat;"><u>${data.val().Nama}</u></span></q>`;

        if (inputNama.value == data.val().Nama) {
            labelNama.style.display = 'none';
            inputNama.style.display = 'none';
            labelPassword.style.visibility = 'visible';
            inputPassword.style.visibility = 'visible';
            inputNama.style.backgroundColor = '#290500';
            document.getElementById('hapus-btn').innerHTML = `<button type="button" id="del-submit" onclick="deleteaccount('${data.val().Nama}')">Hapus Sekarang</button>`
        } else {
            labelNama.style.display = 'block';
            inputNama.style.display = 'block';
            inputPassword.style.visibility = 'hidden';
            labelPassword.style.visibility = 'hidden';
            inputNama.style.backgroundColor = '#740d00';
        }
    })
}


window.addEventListener('resize', function () {
    if (this.window.innerWidth <= 870) {
        kazek();
    } else {
        fieldProfil.style.display = 'inline';
    }
});


function kazek() {
    if (opened === true) {
        fieldProfil.style.display = 'block';
    } else {
        fieldProfil.style.display = 'none';
    }
}