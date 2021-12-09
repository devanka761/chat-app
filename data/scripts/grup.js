var grupkey = '';

function kirimPesanGrup(namaGrup, idGrup, passwordGrup) {

    grupkey = idGrup;

    var inputPassword = document.getElementById('grup-password');

    document.getElementById('grup-err').innerHTML = '';

    if (inputPassword.value !== passwordGrup) {
        setTimeout(() => {
            return document.getElementById('grup-err').innerHTML = 'Password Salah';
        }, 500)
    } else {
        document.querySelector('.cepe-middle').scrollBy(0, 100000);

        document.getElementById('connect').style.display = 'none';
        document.getElementById('inside').style.display = 'none';
        document.getElementById('cepe').style.display = 'block';

        document.getElementById('input-chat').style.display = 'none';
        document.getElementById('kirim-vn').style.display = 'none';
        document.getElementById('kirim-teks').style.display = 'none';
        document.getElementById('input-pict').style.display = 'none';
        document.getElementById('pict-files').style.display = 'none';
    }

    document.getElementById('nama-chat-lain').innerHTML = namaGrup;

    rdb.ref('chatGrup').child(idGrup).on('child_added', (data) => {
        var sms = data.val();
        var msg = '';
        var pengirim = sms.UID;
        var pesanGambar = '/gambarGrup';
        var pesanSuara = '/suaraGrup';

        if (sms.Pesan.indexOf(pesanGambar) !== -1) {
            msg = `<img src="${sms.Pesan}"/>`;
        } else if (sms.Pesan.indexOf(pesanSuara) !== -1) {
            msg = `<audio controls controlsList="nodownload"><source src="${sms.Pesan}" type="audio/ogg"></audio>`
        } else {
            msg = sms.Pesan;
        }

        if (pengirim == auth.currentUser.uid) {
            if (sms.Pesan == '2w5STxSYSVF8BcQFJBNWyy4QE') {
                document.getElementById('cepe-middle').innerHTML += `<div class="untai-kita" id="${data.key}">
                <div class="pesan-chat" id="pesan-chat" style="color: #448000; font-style: italic;">Pesan Telah Dihapus</div>
            </div>`;
                document.querySelector('.cepe-middle').scrollBy(0, 100000);
            } else {
                document.getElementById('cepe-middle').innerHTML += `<div class="untai-kita" id="${data.key}">
                    <div class="tanggal-kita" id="tanggal-kita">${sms.Tanggal}</div>
                    <div class="pesan-chat" id="pesan-chat">${msg}</div>
                    <div class="jam-kita" id="jam-kita">${sms.Jam} <i onclick="hapusChatGrup('${grupkey}', '${data.key}')" class="fas fa-trash-alt" style="color: red; cursor: pointer;"></i></div>
                </div>`;
                document.querySelector('.cepe-middle').scrollBy(0, 100000);
            }
        } else {
            if (sms.Pesan == '2w5STxSYSVF8BcQFJBNWyy4QE') {
                document.getElementById('cepe-middle').innerHTML += `<div class="untai-lain" id="${data.key}">
                <div class="gl-nama-lain" id="nama-lain">${sms.Nama}</div>
                <div class="pesan-chat" id="pesan-chat" style="color: #448000; font-style: italic;">Pesan Telah Dihapus</div>
            </div>`;
                document.querySelector('.cepe-middle').scrollBy(0, 100000);
            } else {
                document.getElementById('cepe-middle').innerHTML += `<div class="untai-lain" id="${data.key}">
                    <div class="gl-nama-lain" id="nama-lain">${sms.Nama}</div>
                    <div class="pesan-chat" id="pesan-chat">${msg}</div>
                    <div class="gl-era-lain">${sms.Tanggal} • ${sms.Jam}</div>
                </div>`;
                document.querySelector('.cepe-middle').scrollBy(0, 100000);
            }
        }
    })
    rdb.ref('chatGrup').child(grupkey).on('child_changed', data => {
        document.getElementById(`${data.key}`).innerHTML = `<div class="gl-nama-lain" id="nama-lain">${data.val().Nama}</div> <div class="pesan-chat" id="pesan-chat" style="color: #448000; font-style: italic;">Pesan Telag Dihapus</div>`;
    })

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

function submitGrup() {
    var inputNama = document.getElementById('input-grup-nama');
    var inputInfo = document.getElementById('input-grup-info');
    var inputPassword = document.getElementById('input-grup-password');

    var resultInfo = '';
    if (inputInfo.value == '' || inputInfo.value == null) {
        resultInfo = '8sd8w028wg09';
    } else {
        resultInfo = inputInfo.value;
    }

    if (inputNama.value == '' || inputNama.value == ' ' || inputPassword.value == '' || inputPassword.value == ' ') return alert('Harap Isi Nama dan Password Grup');

    var bektoh = new Date();
    var customTanggal = {
        day: "2-digit"
    };
    var customBulan = {
        month: "2-digit"
    };
    var customTahun = {
        year: "2-digit"
    };
    var tanggal = bektoh.toLocaleDateString('en-US', customTanggal);
    var bulan = bektoh.toLocaleDateString('en-US', customBulan);
    var tahun = bektoh.toLocaleDateString('en-US', customTahun);
    var jam = bektoh.getHours();
    var menit = bektoh.getMinutes();
    var detik = bektoh.getSeconds();
    var ms = bektoh.getMilliseconds();
    var tgl = tahun + bulan + tanggal + jam + menit + detik + ms;

    grupkey = tgl;

    rdb.ref('grup').child(tgl).set({
        "Nama": inputNama.value,
        "Info": resultInfo,
        "Password": inputPassword.value,
        "UID": tgl,
        "Author": auth.currentUser.uid
    })
    openGrup();
    inputNama.value = '';
    inputPassword.value = '';
}

function btnGrupChat() {
    var isi = document.getElementById('grup-input-chat');

    if (isi.value == '' || isi.value == ` ` || isi.value == `  ` || isi.value == `   ` || isi.value == `    `) return;

    var waktu = new Date();
    var customTanggal = {
        day: "2-digit"
    };
    var customBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var customTahun = {
        year: "numeric"
    };
    var tanggal = waktu.toLocaleDateString('en-US', customTanggal)
    var bulan = customBulan[waktu.getMonth()]
    var tahun = waktu.toLocaleDateString('en-US', customTahun)
    var tgl = tanggal + " " + bulan + " " + tahun;
    var jam = new Date().toLocaleString('en-US', {
        hour: "numeric",
        minute: "numeric",
        hour12: false
    });
    rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
        var nama = data.val().Nama;
        rdb.ref(`chatGrup`).child(grupkey).push({
            "Nama": nama,
            "Tanggal": tgl,
            "Jam": jam,
            "UID": auth.currentUser.uid,
            "Pesan": isi.value
        }).then(() => {
            document.getElementById("grup-kirim-teks").style.display = "none";
            document.getElementById("grup-kirim-vn").style.display = "inline";
        })

    })
    isi.value = '';
}

document.getElementById('grup-input-chat').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        btnGrupChat();
    }
})

function teksGrupVN(control) {
    if (control.value !== '') {
        document.getElementById("grup-kirim-teks").setAttribute('style', 'display: inline;');
        document.getElementById("grup-kirim-vn").setAttribute('style', 'display: none;')
    } else {
        document.getElementById("grup-kirim-vn").setAttribute('style', 'display: inline;');
        document.getElementById("grup-kirim-teks").setAttribute('style', 'display: none;')
    }
}

function btnGrupPict() {
    document.getElementById('grup-input-pict').click();
}

document.getElementById('grup-input-pict').onchange = function () {
    var gambar = document.getElementById('grup-input-pict').files[0];
    var user = auth.currentUser.uid;
    var gambarRef = stg.ref(`gambarGrup/${user}/${gambar.name}`);

    var gambarUp = gambarRef.put(gambar);

    document.getElementById('cepe-middle').innerHTML += `<div class="untai-kita" id="untai-upload"><div class="pesan-chat" id="pesan-chat">Sedang Mengupload..</div></div>`;
    document.querySelector('.cepe-middle').scrollBy(0, 100000);

    gambarUp.on('state_changed', () => {
        console.log('Mengupload');
    }, (error) => {
        alert(error.message);
    }, () => {
        document.getElementById('untai-upload').remove();
        gambarUp.snapshot.ref.getDownloadURL().then(imgURL => {
            rdb.ref('users').child(auth.currentUser.uid).on('value', mySelf => {
                var nama = mySelf.val().Nama
                var waktu = new Date();
                var customTanggal = {
                    day: "2-digit"
                };
                var customBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                var customTahun = {
                    year: "numeric"
                };
                var tanggal = waktu.toLocaleDateString('en-US', customTanggal)
                var bulan = customBulan[waktu.getMonth()]
                var tahun = waktu.toLocaleDateString('en-US', customTahun)
                var tgl = tanggal + " " + bulan + " " + tahun;
                var jam = new Date().toLocaleString('en-US', {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: false
                });

                rdb.ref('chatGrup').child(grupkey).push({
                    "Nama": nama,
                    "Tanggal": tgl,
                    "Jam": jam,
                    "UID": auth.currentUser.uid,
                    "Pesan": imgURL
                })
            })
        })
    })
}


let chunks3 = [];
let recorder3;
var timeout3;

function btnGrupVn(control) {
    var logoMic = document.getElementById("grup-mik");

    let device = navigator.mediaDevices.getUserMedia({
        audio: true
    });
    device.then(stream => {
        if (recorder3 === undefined) {
            recorder3 = new MediaRecorder(stream);
            recorder3.ondataavailable = e => {
                chunks3.push(e.data);
                if (recorder3.state === 'inactive') {
                    let blob = new Blob(chunks3, {
                        type: 'audio/webm'
                    });
                    var reader = new FileReader();
                    reader.addEventListener("load", function () {

                        document.getElementById('cepe-middle').innerHTML += `<div class="untai-kita" id="untai-upload"><div class="pesan-chat" id="pesan-chat">Sedang Mengirim VN..</div></div>`;
                        document.querySelector('.cepe-middle').scrollBy(0, 100000);

                        var bektoh = new Date();
                        var jamz = bektoh.toLocaleString('en-US', {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: false
                        });
                        var customTanggal = {
                            day: "2-digit"
                        };
                        var customBulan = {
                            month: "2-digit"
                        };
                        var customBulan2 = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                        var customTahun = {
                            year: "2-digit"
                        };
                        var customTahun2 = {
                            year: "numeric"
                        };
                        var tanggal = bektoh.toLocaleDateString('en-US', customTanggal);
                        var bulan = bektoh.toLocaleDateString('en-US', customBulan);
                        var tahun = bektoh.toLocaleDateString('en-US', customTahun);
                        var bulan2 = customBulan2[bektoh.getMonth()];
                        var tahun2 = bektoh.toLocaleDateString('en-US', customTahun2);
                        var detik = bektoh.getSeconds();
                        var ms = bektoh.getMilliseconds();
                        var tglsm = tanggal + " " + bulan2 + " " + tahun2;
                        var tgl = tanggal + "_" + bulan + "_" + tahun + "-" + jamz + ":" + detik + "_" + ms;

                        var storageRef = stg.ref(`suaraGrup/${auth.currentUser.uid}/${tgl}.opus`);
                        var task = storageRef.put(e.data)

                        task.on('state_changed', function (snap) {}, function (error) {
                            console.log(error.message)
                        }, function () {
                            document.getElementById('untai-upload').remove();
                            task.snapshot.ref.getDownloadURL().then(audioUrl => {
                                rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
                                    var nama = data.val().Nama
                                    firebase.database().ref("chatGrup").child(grupkey).push({
                                        "Jam": jamz,
                                        "UID": auth.currentUser.uid,
                                        "Tanggal": tglsm,
                                        "Nama": nama,
                                        "Pesan": audioUrl
                                    })
                                });
                            })
                        })
                    }, false);

                    reader.readAsDataURL(blob);
                }
            }
            recorder3.start();
            logoMic.setAttribute('class', 'fas fa-stop');
        }
    });
    if (recorder3 !== undefined) {
        if (logoMic.getAttribute('class').indexOf('stop') !== -1) {
            recorder3.stop();
            logoMic.setAttribute('class', 'fa fa-microphone-alt');
        } else {
            chunks3 = [];
            recorder3.start();
            logoMic.setAttribute('class', 'fa fa-stop');
        }
    }
};

function hapusChatGrup(grupKey, untaiKey) {
    rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
        rdb.ref(`chatGrup/${grupKey}`).child(untaiKey).set({
            "Nama": data.val().Nama,
            "Pesan": "2w5STxSYSVF8BcQFJBNWyy4QE",
            "UID": auth.currentUser.uid
        });
    });
}

function bubarGrup(idGrup, passwordGrup, authorGrup) {
    var inputPassword = document.getElementById('grup-password')
    var errorGrup = document.getElementById('grup-err');

    errorGrup.innerHTML = '';

    setTimeout(() => {
        if (authorGrup == auth.currentUser.uid) {
            if (inputPassword.value == passwordGrup) {
                rdb.ref('grup').child(idGrup).remove();
                rdb.ref('chatGrup').child(idGrup).remove();
                errorGrup.innerHTML = 'Berhasil Membubarkan Grup';
                openGrup();
            } else if (inputPassword.value == '') {
                errorGrup.innerHTML = 'Masukkan password terlebih dahulu untuk membubarkan grup';
                return;
            } else {
                errorGrup.innerHTML = 'Password Grup Salah';
                return;
            }
        } else {
            errorGrup.innerHTML = 'Maaf, kamu bukan pembuat grup ini.. Jadi ga bisa hapus ya';
        }
    }, 1000)
}