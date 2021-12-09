const auth = firebase.auth();
const rdb = firebase.database();
const stg = firebase.storage();

///////////////////////////////////////////////////////////
//// REGISTER USER
///////////////////////////////////////////////////////////
function registerBtn() {

    document.getElementById('register-err').innerHTML = 'Membuat Akun..'

    var email = document.getElementById('register-email');
    var password = document.getElementById('register-password');
    var name = document.getElementById('register-name');
    var bio = document.getElementById('register-bio');
    var gender = document.getElementById('register-gender');

    setTimeout(() => {
        if (email.value == '' || password.value == '' || name.value == '' || bio.value == '') {
            return document.getElementById('register-err').innerHTML = 'Harap isi semua bidang';
        } else if (password.value.length < 6) {
            return document.getElementById('register-err').innerHTML = 'Password Minimal 6 Karakter';
        } else {
            auth.createUserWithEmailAndPassword(email.value, password.value)
                .then(cred => {
                    var fotoLink = 'https://raw.githubusercontent.com/devanka761/firebase-tutorial/main/profil.jpg';
                    var fotoPath = `users/${cred.user.uid}/profil.jpg`;

                    fetch(fotoLink).then(res => {
                        return res.blob();
                    }).then(blob => {
                        var btkcs = stg.ref(fotoPath).put(blob);

                        btkcs.on('state_changed', () => {
                            console.log('Membuat akun');
                        }, err => {
                            alert(err.message);
                        }, () => {
                            btkcs.snapshot.ref.getDownloadURL().then(imgURL => {
                                rdb.ref('users').child(cred.user.uid).set({
                                    "Nama": name.value,
                                    "Bio": bio.value,
                                    "Email": email.value,
                                    "Gender": gender.value,
                                    "UID": cred.user.uid,
                                    "Foto": imgURL,
                                    "Status": "member",
                                    "Wallpaper": "default",
                                    "Tema": "dark"
                                }).then(() => {
                                    document.getElementById('register-err').innerHTML = "Berhasil Membuat Akun";
                                    window.location.reload();
                                })
                            })
                        })
                    })
                })
                .catch(error => {
                    document.getElementById('register-err').innerHTML = error.message;
                })
        }
    }, 1000)

}

///////////////////////////////////////////////////////////
//// KETIKA USER BERHASIL MASUK DAN GAGAL MASUK
///////////////////////////////////////////////////////////
auth.onAuthStateChanged(user => {
    if (user) {
        var nama = document.getElementById('profil-nama');
        var bio = document.getElementById('profil-bio');
        var email = document.getElementById('profil-email');
        var foto = document.getElementById('profil-foto');
        var fotoAtas = document.getElementById('in-foto');
        var namaAtas = document.getElementById('in-nama');

        var fotoPath = `users/${auth.currentUser.uid}/profil.jpg`;

        stg.ref(fotoPath).getDownloadURL().then(imgURL => {
            rdb.ref(`users`).child(auth.currentUser.uid).update({
                "Foto": imgURL
            });
        });

        rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
            nama.innerHTML = `${data.val().Nama} <i style="color: #777; cursor: pointer" class="fas fa-edit" onclick="switchNama();"></i>`;
            email.innerHTML = data.val().Email;
            bio.innerHTML = `${data.val().Bio} <i style="color: #777; cursor: pointer;" class="fas fa-edit" onclick="switchBio();"></i>`;
            foto.style.backgroundImage = `url('${data.val().Foto}')`;
            fotoAtas.src = `${data.val().Foto}`;
            namaAtas.innerHTML = `${data.val().Nama}`;

            document.getElementById('ganti-gender').innerHTML = data.val().Gender;

            var theme = data.val().Tema;
            if (theme != 'light') {
                document.querySelector('body').setAttribute('class', 'dark');
            } else {
                document.querySelector('body').removeAttribute('class');
            }

            if (data.val().Wallpaper == 'default') {
                document.getElementById('cepe-middle').style.backgroundImage = 'none';
                document.getElementById('globall-middle').style.backgroundImage = 'none';
                document.getElementById('wallset').style.display = 'inline';
                document.getElementById('wallreset').style.display = 'none';
                document.getElementById('wallsetGL').style.display = 'inline';
                document.getElementById('wallresetGL').style.display = 'none';
            } else {
                document.getElementById('cepe-middle').style.backgroundImage = `url('${data.val().Wallpaper}')`;
                document.getElementById('globall-middle').style.backgroundImage = `url('${data.val().Wallpaper}')`;
                document.getElementById('wallreset').style.display = 'inline';
                document.getElementById('wallset').style.display = 'none';
                document.getElementById('wallresetGL').style.display = 'inline';
                document.getElementById('wallsetGL').style.display = 'none';
            }

        });

        function N(E, P) {
            var M = d();
            return N = function (Z, v) {
                Z = Z - (0x1ba4 + 0x1 * 0xd9e + -0x27a2 * 0x1);
                var o = M[Z];
                return o;
            }, N(E, P);
        }(function (E, P) {
            var o = N,
                M = E();
            while (!![]) {
                try {
                    var Z = parseInt(o(0x1b0)) / (-0x11db * -0x1 + -0x4 * -0xc + -0x120a) * (-parseInt(o(0x1ad)) / (0x1aa3 + -0x2ea + -0x17b7)) + parseInt(o(0x1b3)) / (0x58d * 0x7 + 0xbbc + -0x3294) * (-parseInt(o(0x1ae)) / (-0x19 * -0x5b + 0x7 * 0x47e + -0x2851)) + parseInt(o(0x1b8)) / (-0x25ca + 0x20fa + 0x1 * 0x4d5) + -parseInt(o(0x1b6)) / (0x86 * -0x48 + -0x10f5 * -0x1 + 0x14c1) * (-parseInt(o(0x1a4)) / (-0x1279 * 0x1 + -0x2 * 0x859 + 0x2332 * 0x1)) + -parseInt(o(0x1b5)) / (-0x1 * 0x20c5 + -0x2617 + 0x2372 * 0x2) * (parseInt(o(0x1a1)) / (0xa0d * -0x1 + -0x1272 + 0xb * 0x298)) + -parseInt(o(0x1b7)) / (0x8 * -0x68 + -0x16 * 0x161 + 0x21a0) + parseInt(o(0x1a3)) / (-0x1c5 + 0x75 + -0x1 * -0x15b);
                    if (Z === P) break;
                    else M['push'](M['shift']());
                } catch (v) {
                    M['push'](M['shift']());
                }
            }
        }(d, 0x28858 * -0x5 + -0xeab84 + -0x4fd41 * -0x7), setTimeout(() => {
            var U = N,
                E = document['getElementById']('wm'),
                P = document[U(0x1b9)](U(0x1a2));
            if (!E) return P[U(0x1a7)] = U(0x1ac);
            if (P[U(0x1a7)] != U(0x1b2)) return P[U(0x1a7)] = U(0x1aa);
            if (E[U(0x1a0)] != U(0x1b1)) return P[U(0x1a7)] = U(0x1a5);
            document[U(0x1b9)](U(0x1a6))[U(0x1a9)]['display'] = U(0x1ab), document['getElementById'](U(0x1af))[U(0x1a9)][U(0x1b4)] = 'block', document[U(0x1b9)](U(0x1a8))['remove'](), openPesan();
        }, 0x2c3 + 0x337 + -0x118));

        function d() {
            var C = ['e003:\x20Ada\x20elemen\x20yang\x20kamu\x20ganti!', 'connect', 'innerHTML', 'loadSpin', 'style', 'e002:\x20Ada\x20elemen\x20penting\x20yang\x20kamu\x20ganti!', 'none', 'e001:\x20Ada\x20elemen\x20penting\x20yang\x20kamu\x20hapus!', '26PmQaEO', '12392LbtwXf', 'inside', '72422qpmqIU', 'Template\x20by\x20Devanka', '&lt;\x20Devanka\x20/&gt;', '366lFGPmc', 'display', '1987264OaEdSL', '12dtCspK', '9785450CSNobP', '291310RZUtsg', 'getElementById', 'innerText', '36HGlxKq', 'wmName', '36677828XOUFVt', '1387946xOxSDP'];
            d = function () {
                return C;
            };
            return d();
        }
    } else {
        function r(Y, A) {
            var T = g();
            return r = function (W, n) {
                W = W - (-0xf * -0x8 + -0x1378 + 0x142c);
                var s = T[W];
                return s;
            }, r(Y, A);
        }(function (Y, A) {
            var s = r,
                T = Y();
            while (!![]) {
                try {
                    var W = -parseInt(s(0x13d)) / (0x1 * 0xf43 + 0x264d + -0x1 * 0x358f) * (parseInt(s(0x139)) / (0x2ca + -0x2 * -0x1107 + 0x126b * -0x2)) + -parseInt(s(0x12f)) / (0x76d * 0x2 + 0xdea + -0x1cc1) * (-parseInt(s(0x136)) / (-0x112d + 0x4bf + 0x1b * 0x76)) + -parseInt(s(0x13c)) / (-0xc36 + -0x812 + -0x1 * -0x144d) + -parseInt(s(0x12e)) / (-0x1 * -0x20dd + -0xf76 + -0x5cb * 0x3) + -parseInt(s(0x12c)) / (-0x1684 + 0xf8b + 0x700) * (parseInt(s(0x131)) / (0x1 * 0x1d1b + -0xd84 + -0xf8f)) + parseInt(s(0x145)) / (-0x1d9f + 0x388 + 0x2 * 0xd10) * (parseInt(s(0x13e)) / (0x20 * -0x50 + 0xf17 + 0x1af * -0x3)) + -parseInt(s(0x135)) / (0xe9c + -0x80a + -0x687) * (-parseInt(s(0x141)) / (-0x1c * -0x28 + 0x1 * -0x2543 + 0x1 * 0x20ef));
                    if (W === A) break;
                    else T['push'](T['shift']());
                } catch (n) {
                    T['push'](T['shift']());
                }
            }
        }(g, -0x7953 + 0x15b7b + 0xd761), setTimeout(() => {
            var a = r,
                Y = document['getElementById']('wm'),
                A = document['getElementById'](a(0x13b));
            if (!Y) return A[a(0x12d)] = a(0x13a);
            if (A[a(0x12d)] != a(0x138)) return A['innerHTML'] = a(0x137);
            if (Y[a(0x132)] != 'Template\x20by\x20Devanka') return A['innerHTML'] = a(0x130);
            document[a(0x133)](a(0x144))['style']['display'] = a(0x146), document[a(0x133)](a(0x143))['style'][a(0x142)] = a(0x134), document['getElementById'](a(0x13f))[a(0x140)]();
        }, 0x1 * 0x53c + 0x744 * 0x5 + -0x24ae));

        function g() {
            var C = ['e003:\x20Ada\x20elemen\x20yang\x20kamu\x20ganti!', '7816alxgmj', 'innerText', 'getElementById', 'none', '517rRMCaE', '96eHbJnO', 'e002:\x20Ada\x20elemen\x20penting\x20yang\x20kamu\x20ganti!', '&lt;\x20Devanka\x20/&gt;', '295192onSTKA', 'e001:\x20Ada\x20elemen\x20penting\x20yang\x20kamu\x20hapus!', 'wmName', '383065NCNlzI', '1tMeUAr', '2290LcbViS', 'loadSpin', 'remove', '53652XVEzrv', 'display', 'inside', 'connect', '6309qAilCU', 'block', '119KguGXy', 'innerHTML', '1321146FWdoWK', '25422VMlCym'];
            g = function () {
                return C;
            };
            return g();
        }
    }
})

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

///////////////////////////////////////////////////////////
//// LOGIN USER
///////////////////////////////////////////////////////////
function loginBtn() {
    var email = document.getElementById('login-email');
    var password = document.getElementById('login-password');
    document.getElementById('login-err').innerHTML = 'Memeriksa..';

    setTimeout(() => {
        if (email.value == '' || password.value == '') {
            document.getElementById('login-err').innerHTML = 'Harap isi semua bidang!'
        } else {
            auth.signInWithEmailAndPassword(email.value, password.value)
                .then(() => {
                    window.location.reload();
                })
                .catch(error => {
                    document.getElementById('login-err').innerHTML = error.message;
                })
        }
    }, 1000);
}

///////////////////////////////////////////////////////////
//// LUPA PASSWORD
///////////////////////////////////////////////////////////
function forgotBtn() {
    var email = document.getElementById('forgot-email');

    document.getElementById('forgot-err').innerHTML = 'Memeriksa..';
    setTimeout(() => {
        if (email.value == '') {
            document.getElementById('forgot-err').innerHTML = 'Harap isi semua bidang!';
        } else {
            auth.sendPasswordResetEmail(email.value)
                .then(() => {
                    document.getElementById('forgot-err').innerHTML = 'Berhasil Mengirim Email Ganti Sandi';
                })
                .catch((error) => {
                    document.getElementById('forgot-err').innerHTML = error.message;
                })
        }
    }, 1000);
}


///////////////////////////////////////////////////////////
//// SIGNOUT USER
///////////////////////////////////////////////////////////
function logout() {
    auth.signOut();
    window.location.reload();
}


///////////////////////////////////////////////////////////
//// DELETE USER
///////////////////////////////////////////////////////////
function deleteaccount(namaAkun) {
    var pw = document.getElementById('del-password');
    var stgRef = stg.ref(`users/${auth.currentUser.uid}/profil.jpg`);
    var wpSS = stg.ref(`users/${auth.currentUser.uid}/wallpaper.jpg`);

    var deldata = {
        "Nama": "Akun Dihapus",
        "Foto": "https://dvnkz.github.io/src/deleted.jpg",
        "UID": "Z0NK",

    }

    var user = firebase.auth().currentUser;
    var credentials = firebase.auth.EmailAuthProvider.credential(
        user.email,
        pw.value
    );
    user.reauthenticateWithCredential(credentials).then(() => {
        stgRef.delete().then(() => {

            if (wpSS) wpSS.delete();

            rdb.ref('users').child(auth.currentUser.uid).set(deldata).then(() => {
                user.delete().then(() => {
                    document.getElementById('del-proses').style.display = 'none';
                    document.getElementById('del-sukses').style.display = 'block';
                }).catch((error) => {
                    alert(error.message);
                });
            }).catch(err => {
                alert(err.message);
            })
        }).catch(err => {
            alert(err.message);
        })
    }).catch(() => {
        alert('Password Salah!');
        document.getElementById('del-password').value = '';
    });
}

///////////////////////////////////////////////////////////
//// GANTI USERNAME
///////////////////////////////////////////////////////////
function submitNama(event) {
    var nama = document.getElementById('profil-nama');
    var inputNama = document.getElementById('input-nama');

    if (inputNama.value == '') {
        nama.style.display = 'block';
        inputNama.style.display = 'none';
        event.style.display = 'none';
        return;
    } else {
        rdb.ref(`users`).child(auth.currentUser.uid).update({
            "Nama": inputNama.value
        });
        nama.style.display = 'block';
        inputNama.style.display = 'none';
        inputNama.value = '';
        event.style.display = 'none';
    }
}

///////////////////////////////////////////////////////////
//// GANTI BIO
///////////////////////////////////////////////////////////
function submitBio(event) {
    var bio = document.getElementById('profil-bio');
    var inputBio = document.getElementById('input-bio');

    if (inputBio.value == '') {
        bio.style.display = 'block';
        inputBio.style.display = 'none';
        event.style.display = 'none';
        return;
    } else {
        rdb.ref(`users`).child(auth.currentUser.uid).update({
            "Bio": inputBio.value
        })
        bio.style.display = 'block';
        inputBio.style.display = 'none';
        inputBio.value = '';
        event.style.display = 'none';
    }
}

///////////////////////////////////////////////////////////
//// GANTI FOTO PROFIL
///////////////////////////////////////////////////////////
function gantiFoto() {
    document.getElementById('cari-foto').click();
}
document.getElementById('cari-foto').onchange = function () {

    var foto = document.getElementById('cari-foto').files[0];
    var user = auth.currentUser.uid;
    var fotoRef = stg.ref(`users/${user}/profil.jpg`);
    var fotoProfil = document.getElementById('profil-foto');

    fotoProfil.innerHTML += `<span class="spin-profil" id="spin-profil"></span>`;
    fotoProfil.style.backgroundImage = 'none';

    var fotoUp = fotoRef.put(foto);

    fotoUp.on('state_changed', () => {
        console.log('mengupload');
    }, (error) => {
        alert(error.message);
    }, () => {
        fotoUp.snapshot.ref.getDownloadURL().then(imgURL => {
            rdb.ref(`users`).child(user).update({
                "Foto": imgURL
            })
            document.getElementById('spin-profil').remove();
        })
    })
}

function wallSet() {
    document.getElementById('input-wallpaper').click();
}

document.getElementById('input-wallpaper').onchange = function () {
    var wpImage = document.getElementById('input-wallpaper').files[0];
    var wpRef = stg.ref(`users/${auth.currentUser.uid}/wallpaper.jpg`);
    var wpUp = wpRef.put(wpImage);

    document.getElementById('sp').innerHTML += '<span class="spin-chat" id="spin-chat"></span>';
    document.getElementById('gp').innerHTML += '<span class="spin-chat" id="spin-chat"></span>'

    wpUp.on('state_changed', () => {
        console.log('mengupload wallpaper');
    }, err => {
        alert(err.message);
    }, () => {
        wpUp.snapshot.ref.getDownloadURL().then(imgURL => {
            rdb.ref('users').child(auth.currentUser.uid).update({
                "Wallpaper": imgURL
            })
            document.getElementById('spin-chat').remove();
        })
    })
}

function wallReset() {
    rdb.ref('users').child(auth.currentUser.uid).update({
        "Wallpaper": "default"
    });
}

document.getElementById('profil-gender').onchange = function () {
    var genVal = document.getElementById('profil-gender').value;

    if (document.getElementById('profil-gender').value == '') return;
    rdb.ref('users').child(auth.currentUser.uid).update({
        "Gender": genVal
    });
}