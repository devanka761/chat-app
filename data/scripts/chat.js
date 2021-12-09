var friend_id = '';
var chatKey = '';

function kirimPesanPribadi(namaLain, fotoLain, keyLain) {

    document.querySelector('.cepe-middle').scrollBy(0, 100000);
    document.getElementById('nama-chat-lain').innerHTML = `<img src='${fotoLain}'> ${namaLain}`;

    var connect = document.getElementById('connect');
    var inside = document.getElementById('inside');
    var chatPribadi = document.getElementById('cepe');

    document.getElementById('grup-input-chat').style.display = 'none';
    document.getElementById('grup-kirim-vn').style.display = 'none';
    document.getElementById('grup-kirim-teks').style.display = 'none';
    document.getElementById('grup-input-pict').style.display = 'none';
    document.getElementById('grup-pict-files').style.display = 'none';

    friend_id = keyLain;
    var friendList = {
        friendId: keyLain,
        userId: auth.currentUser.uid
    }
    var rdbRef = firebase.database().ref("friend_list");
    var flag = false;

    rdbRef.on("value", function (friends) {

        document.getElementById('cepe-middle').innerHTML = '';

        friends.forEach(function (data) {
            var pguna = data.val();
            if ((pguna.friendId == friendList.friendId && pguna.userId == friendList.userId) || ((pguna.friendId == friendList.userId && pguna.userId == friendList.friendId))) {
                flag = true;
                chatKey = data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref("friend_list").push(friendList, function (error) {
                if (error) alert("error")
                else {
                    connect.style.display = 'none';
                    inside.style.display = 'none';
                    chatPribadi.style.display = 'block';
                    document.querySelector('.cepe-middle').scrollBy(0, 100000);
                }
            }).getKey()
        } else {
            connect.style.display = 'none';
            inside.style.display = 'none';
            chatPribadi.style.display = 'block';
            document.querySelector('.cepe-middle').scrollBy(0, 100000);

            rdb.ref('chatPribadi').child(chatKey).on('child_added', (data) => {
                var sms = data.val();
                var msg = '';
                var pesanGambar = '/gambarCP';
                var pesanSuara = '/suaraCP';

                if (sms.Pesan.indexOf(pesanGambar) !== -1) {
                    msg = `<img src="${sms.Pesan}"/>`;
                } else if (sms.Pesan.indexOf(pesanSuara) !== -1) {
                    msg = `<audio controls controlsList="nodownload"><source src="${sms.Pesan}" type="audio/ogg"></audio>`
                } else {
                    msg = sms.Pesan;
                }
                if (sms.UID == auth.currentUser.uid) {
                    if (sms.Pesan == '2w5STxSYSVF8BcQFJBNWyy4QE') {
                        document.getElementById('cepe-middle').innerHTML += `<div class="untai-kita" id="${data.key}">
                        <div class="pesan-chat" id="pesan-chat" style="color: #448000; font-style: italic;">Pesan Telah Dihapus</div>
                    </div>`;
                        document.querySelector('.cepe-middle').scrollBy(0, 100000);
                    } else {
                        document.getElementById('cepe-middle').innerHTML += `<div class="untai-kita" id="${data.key}">
                            <div class="tanggal-kita" id="tanggal-kita">${sms.Tanggal}</div>
                            <div class="pesan-chat" id="pesan-chat">${msg}</div>
                            <div class="jam-kita" id="jam-kita">${sms.Jam} <i onclick="hapusChat('${chatKey}', '${data.key}')" class="fas fa-trash-alt" style="color: red; cursor: pointer;"></i></div>
                        </div>`;
                        document.querySelector('.cepe-middle').scrollBy(0, 100000);
                    }
                } else {
                    if (sms.Pesan == '2w5STxSYSVF8BcQFJBNWyy4QE') {
                        document.getElementById('cepe-middle').innerHTML += `<div class="untai-lain" id="${data.key}">
                        <div class="pesan-chat" id="pesan-chat" style="color: #448000; font-style: italic;">Pesan Telah Dihapus</div>
                    </div>`;
                        document.querySelector('.cepe-middle').scrollBy(0, 100000);
                    } else {
                        document.getElementById('cepe-middle').innerHTML += `<div class="untai-lain" id="${data.key}">
                            <div class="tanggal-lain" id="tanggal-lain">${sms.Tanggal}</div>
                            <div class="pesan-chat" id="pesan-chat">${msg}</div>
                            <div class="jam-lain" id="jam-lain">${sms.Jam}</div>
                        </div>`;
                        document.querySelector('.cepe-middle').scrollBy(0, 100000);
                    }
                }
                document.querySelector('.cepe-middle').scrollBy(0, 100000);
            });

            rdb.ref('chatPribadi').child(chatKey).on('child_changed', snap => {
                document.getElementById(`${snap.key}`).innerHTML = `<div class="pesan-chat" id="pesan-chat" style="color: #448000; font-style: italic;">Pesan Telag Dihapus</div>`
            });
        }
        document.querySelector('.cepe-middle').scrollBy(0, 100000);
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

function btnChat() {
    var isi = document.getElementById('input-chat');

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

        rdb.ref('chatPribadi').child(chatKey).push({
            "Nama": nama,
            "Tanggal": tgl,
            "Jam": jam,
            "UID": auth.currentUser.uid,
            "Pesan": isi.value
        })
        document.getElementById("kirim-teks").style.display = "none";
        document.getElementById("kirim-vn").style.display = "inline";
        isi.value = '';
    })
}

document.getElementById('input-chat').addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        btnChat();
    }
})

function btnPict() {
    document.getElementById('input-pict').click();
}

document.getElementById('input-pict').onchange = function () {
    var gambar = document.getElementById('input-pict').files[0];
    var user = auth.currentUser.uid;
    var gambarRef = stg.ref(`gambarCP/${user}/${gambar.name}`);

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

                rdb.ref('chatPribadi').child(chatKey).push({
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

function chatBack() {
    window.location.reload();
}

function teksVN(control) {
    if (control.value !== '') {
        document.getElementById("kirim-teks").removeAttribute('style');
        document.getElementById("kirim-vn").setAttribute('style', 'display: none;')
    } else {
        document.getElementById("kirim-vn").removeAttribute('style');
        document.getElementById("kirim-teks").setAttribute('style', 'display: none;')
    }
}

let chunks = [];
let recorder;
var timeout;

function btnVn(control) {
    var logoMic = document.getElementById("mik");

    let device = navigator.mediaDevices.getUserMedia({
        audio: true
    });
    device.then(stream => {
        if (recorder === undefined) {
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => {
                chunks.push(e.data);
                if (recorder.state === 'inactive') {
                    let blob = new Blob(chunks, {
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

                        var storageRef = stg.ref(`suaraCP/${auth.currentUser.uid}/${tgl}.opus`);
                        var task = storageRef.put(e.data)

                        task.on('state_changed', function (snap) {}, function (error) {
                            console.log(error.message)
                        }, function () {
                            document.getElementById('untai-upload').remove();
                            task.snapshot.ref.getDownloadURL().then(audioUrl => {
                                rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
                                    var nama = data.val().Nama
                                    firebase.database().ref("chatPribadi").child(chatKey).push({
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
            recorder.start();
            logoMic.setAttribute('class', 'fas fa-stop');
        }
    });
    if (recorder !== undefined) {
        if (logoMic.getAttribute('class').indexOf('stop') !== -1) {
            recorder.stop();
            logoMic.setAttribute('class', 'fa fa-microphone-alt');
        } else {
            chunks = [];
            recorder.start();
            logoMic.setAttribute('class', 'fa fa-stop');
        }
    }
};

function hapusChat(chatKey, untaiKey) {
    rdb.ref('users').child(auth.currentUser.uid).on('value', data => {
        rdb.ref(`chatPribadi/${chatKey}`).child(untaiKey).set({
            "Pesan": "2w5STxSYSVF8BcQFJBNWyy4QE",
            "Nama": data.val().Nama,
            "UID": auth.currentUser.uid
        });
    });
}

function akunTerhapus() {
    alert('Tidak bisa membuka akun yang terhapus');
    return;
}