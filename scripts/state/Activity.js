class Activity {
    constructor() {
        // DEFAULT VALUE UNTUK USER
        this.last_seen = `${jam}:${new Date().getSeconds()} - ${tgl}`;
        // NAMA DI LOCALSTORAGE
        this.saveFileKey = "kirimin_lastActivity";
    }

    save() {
        // SIMPAN BEBERAPA DATA KE LOCALSTORAGE
        window.localStorage.setItem(this.saveFileKey, JSON.stringify({
            last_seen: this.last_seen,
            userState: {
                last: userState.last,
                last_visited_uid: userState.last_visited_uid,
                last_visited_name: userState.last_visited_name,
                last_visited_picture: userState.last_visited_picture,
                last_guild_member_count: userState.last_guild_member_count,
                last_guild_owner: userState.last_guild_owner,
                last_theme: userState.last_theme,
            }
        }))
    }

    getSaveFile() {
        try{
            // COBA UNTUK MENDAPATKAN SESUATU DARI LOCALSTORAGE
            const file = window.localStorage.getItem(this.saveFileKey);
            // APABILA TIDAK ADA, MAKA RETURNKAN NULL
            return file ? JSON.parse(file) : null;
        } catch {
            // APABILA TIDAK DIKETAHUI/KESALAHAN, MAKA RETURNKAN NULL
            return null;
        }
    }

    load() {
        // MINTA SESUATU DARI getSaveFile
        const file = this.getSaveFile();
        // JIKA YANG DIMINTA ADA
        if(file) {
            // MAKA GANTI DEFAULT "personal" MENJADI SAMA DENGAN YANG ADA PADA LOCALSTORAGE
            this.last_seen = file.last_seen;
            Object.keys(file.userState).forEach(key => {
                userState[key] = file.userState[key];
            })
        }
    } 
}