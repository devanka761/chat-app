class UserState {
    constructor() {
        // DEFAULT VALUE
        
        // ROOM
        this.last = "first";
        // PESAN
        this.last_visited_uid = null;
        this.last_visited_name = null;
        this.last_visited_picture = null;
        // GRUP
        this.last_guild_member_count = null;
        this.last_guild_owner = null;
        // CONFIRM
        this.next = false;
        this.last_theme = "dark";
        this.last_lang = "indonesia";
    }

    changeLast(data) {
        this.last = data; // PUSH DATA KE DEFAULT VALUE
    }
    changeUID(data) {
        this.last_visited_uid = data; // PUSH DATA KE DEFAULT VALUE
    }
    changeNama(data) {
        this.last_visited_name = data; // PUSH DATA KE DEFAULT VALUE
    }
    changeFoto(data) {
        this.last_visited_picture = data; // PUSH DATA KE DEFAULT VALUE
    }
    changeMember(data) {
        this.last_guild_member_count = data; // PUSH DATA KE DEFAULT VALUE
    }
    changeOwner(data) {
        this.last_guild_owner = data; // PUSH DATA KE DEFAULT VALUE
    }
    changeTema(data) {
        this.last_theme = data; // PUSH DATA KE DEFAULT VALUE
    }
}
// SUPAYA TIDAK KEREPOTAN & KEBINGUNGAN SAAT NANTI INGIN MEMANGGILNYA
window.userState = new UserState();

/*
    SUBSCRIBE: DEVANKA 761 
    https://www.youtube.com/c/RG761

    IG: " @dvnkz_ "
*/