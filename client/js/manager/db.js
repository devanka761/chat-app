class db {
  constructor() {
    this.ref = {};
    this.peer = new Map();
  }
  updateHandelr(snaps) {
    snaps.forEach(k => {
      if(k.type === 'room') {
        this.ref[k.room][k.chat_id] = k.data;
      } else if(k.type === 'chat_edit') {
        this.ref[k.room][k.chat_id].chats[k.text_id] = k.data;
      } else if(k.type === 'chat_new') {
        this.ref[k.room][k.chat_id].chats[k.text_id] = k.data;
      } else if(k.type === 'read_msg') {
        const cdb = this.ref[k.room]?.[k.chat_id]?.chats;
        if(!cdb) return;
        Object.keys(cdb).forEach(ch => {
          if(!cdb[ch].w) this.ref[k.room][k.chat_id].chats[ch].w = [];
          if(!cdb[ch].w.includes(k.users)) {
            this.ref[k.room][k.chat_id].chats[ch].w.push(k.users);
          }
        });
      } else if(k.type === 'friendAccept') {
        this.ref.friends[k.friend_id] = k.data;
      }
    });
  }
}

export default new db();