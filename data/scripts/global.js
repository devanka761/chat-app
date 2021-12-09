function openGL() {

    document.querySelector('.globall-middle').scrollBy(0, 100000);

    var connect = document.getElementById('connect');
    var inside = document.getElementById('inside');
    var chatGlobal = document.getElementById('globall');

    connect.style.display = 'none';
    inside.style.display = 'none';
    chatGlobal.style.display = 'block';
    document.querySelector('.globall-middle').scrollBy(0, 100000);

    rdb.ref('global').on('child_added', data => {

        var sms = data.val();
        var msg = '';
        var pesanGambar = '/gambarGL';
        var pesanSuara = '/suaraGL';

        if (sms.Pesan.indexOf(pesanGambar) !== -1) {
            msg = `<img src = "${sms.Pesan}"/> `;
        } else if (sms.Pesan.indexOf(pesanSuara) !== -1) {
            msg = `<audio controls controlsList="nodownload"><source src="${sms.Pesan}" type="audio/ogg"></audio>`
        } else {
            msg = sms.Pesan;
        }


        if (data.val().UID === auth.currentUser.uid) {
            if (sms.Pesan == '2w5STxSYSVF8BcQFJBNWyy4QE') {
                document.getElementById('globall-middle').innerHTML += `<div class="gl-untai-kita" id="${data.key}">
                <div class="gl-pesan-chat" id="gl-pesan-chat" style="color: #448000; font-style: italic;">Pesan Telah Dihapus</div>
            </div>`;
                document.querySelector('.globall-middle').scrollBy(0, 100000);
            } else {
                document.getElementById('globall-middle').innerHTML += `<div class="gl-untai-kita" id="${data.key}">
                <div><i onclick="hapusChatGlobal('${data.key}')" class="fas fa-trash-alt" style="color: red; cursor: pointer;"></i></div>
            <div class="gl-pesan-chat" id="gl-pesan-chat">${msg}</div>
            <div class="gl-era-kita" id="gl-era-kita">${data.val().Jam} • ${data.val().Tanggal}</div>
        </div>`;

                document.querySelector('.globall-middle').scrollBy(0, 100000);
            }
        } else {
            if (sms.Pesan == '2w5STxSYSVF8BcQFJBNWyy4QE') {
                document.getElementById('globall-middle').innerHTML += `<div class="gl-untai-lain" id="${data.key}">
                <div class="gl-nama-lain" id="gl-nama-lain">${data.val().Nama}</div>
                <div class="gl-pesan-chat" id="gl-pesan-chat" style="color: #448000; font-style: italic;">Pesan Telah Dihapus</div>
            </div>`;
                document.querySelector('.globall-middle').scrollBy(0, 100000);
            } else {
                document.getElementById('globall-middle').innerHTML += `<div class="gl-untai-lain" id="${data.key}">
            <div class="gl-nama-lain" id="gl-nama-lain">${data.val().Nama}</div>
            <div class="gl-pesan-chat" id="gl-pesan-chat">${msg}</div>
            <div class="gl-era-lain" id="gl-era-lain">${data.val().Jam} • ${data.val().Tanggal}</div>
        </div>`;

                document.querySelector('.globall-middle').scrollBy(0, 100000);
            }
        }
        document.querySelector('.globall-middle').scrollBy(0, 100000);
    })
    rdb.ref('global').on('child_changed', data => {
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

function teksGlVN(control) {
    if (control.value !== '') {
        document.getElementById("gl-kirim-teks").removeAttribute('style');
        document.getElementById("gl-kirim-vn").setAttribute('style', 'display: none;')
    } else {
        document.getElementById("gl-kirim-vn").removeAttribute('style');
        document.getElementById("gl-kirim-teks").setAttribute('style', 'display: none;')
    }
}

document.getElementById('gl-input-chat').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        btnGlChat();
    }
})

function btnGlChat() {
    var inputPesan = document.getElementById('gl-input-chat');

    if (inputPesan.value == null || inputPesan.value == '' || inputPesan.value == ' ' || inputPesan.value == '  ' || inputPesan.value == '   ') return;

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
        var chatData = {
            "Nama": data.val().Nama,
            "UID": data.key,
            "Jam": jam,
            "Tanggal": tgl,
            "Pesan": inputPesan.value
        }
        rdb.ref('global').push(chatData);

        inputPesan.value = '';
        document.getElementById('gl-kirim-vn').style.display = 'inline';
        document.getElementById('gl-kirim-teks').style.display = 'none';
    })
}

function btnGlPict() {
    document.getElementById('gl-input-pict').click();
}

document.getElementById('gl-input-pict').onchange = function () {

    document.getElementById('globall-middle').innerHTML += `<div class="untai-kita" id="gl-untai-upload"><div class="pesan-chat" id="pesan-chat">Sedang Mengupload..</div></div>`;
    document.querySelector('.globall-middle').scrollBy(0, 100000);

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

    var gambar = document.getElementById('gl-input-pict').files[0];
    var user = auth.currentUser.uid;
    var gambarRef = stg.ref(`gambarGL/${user}/${gambar.name}`);

    var gambarUp = gambarRef.put(gambar);

    gambarUp.on('state_changed', () => {
        console.log('mengupload');
    }, (error) => {
        alert(error.message);
    }, () => {
        gambarUp.snapshot.ref.getDownloadURL().then(imgURL => {
            rdb.ref('users').child(user).on('value', data => {
                var pesanData = {
                    "Nama": data.val().Nama,
                    "Tanggal": tgl,
                    "Jam": jam,
                    "Pesan": imgURL,
                    "UID": user
                }
                rdb.ref('global').push(pesanData);
                document.getElementById('gl-untai-upload').remove();
            })
        })
    })
}

let chunks2 = [];
let recorder2;
var timeout2;

function btnGlVn(control) {
    var logoMic = document.getElementById("gl-mik");

    let device = navigator.mediaDevices.getUserMedia({
        audio: true
    });
    device.then(stream => {
        if (recorder2 === undefined) {
            recorder2 = new MediaRecorder(stream);
            recorder2.ondataavailable = e => {
                chunks2.push(e.data);
                if (recorder2.state === 'inactive') {
                    let blob = new Blob(chunks2, {
                        type: 'audio/webm'
                    });
                    var reader = new FileReader();
                    reader.addEventListener("load", function () {

                        document.getElementById('globall-middle').innerHTML += `<div class="untai-kita" id="gl-untai-upload"><div class="pesan-chat" id="pesan-chat">Sedang Mengirim VN..</div></div>`;
                        document.querySelector('.globall-middle').scrollBy(0, 100000);

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

                        var storageRef = stg.ref(`suaraGL/${auth.currentUser.uid}/${tgl}.opus`);
                        var task = storageRef.put(e.data)

                        task.on('state_changed', function (snap) {}, function (error) {
                            console.log(error.message)
                        }, function () {
                            document.getElementById('gl-untai-upload').remove();
                            task.snapshot.ref.getDownloadURL().then(audioUrl => {
                                rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
                                    var nama = data.val().Nama
                                    firebase.database().ref("global").push({
                                        "Jam": jam,
                                        "UID": auth.currentUser.uid,
                                        "Tanggal": tgl,
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
            recorder2.start();
            logoMic.setAttribute('class', 'fas fa-stop');
        }
    });
    if (recorder2 !== undefined) {
        if (logoMic.getAttribute('class').indexOf('stop') !== -1) {
            recorder2.stop();
            logoMic.setAttribute('class', 'fa fa-microphone-alt');
        } else {
            chunks2 = [];
            recorder2.start();
            logoMic.setAttribute('class', 'fa fa-stop');
        }
    }
}

function hapusChatGlobal(untaiKey) {
    rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
        rdb.ref(`global`).child(untaiKey).set({
            "Nama": data.val().Nama,
            "Pesan": "2w5STxSYSVF8BcQFJBNWyy4QE",
            "UID": auth.currentUser.uid
        });
    });
}