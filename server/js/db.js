const fs = require('fs');

const dirpath = './server/db';
class DevankaDatabase {
  constructor() {
    this.ref = {u:{},t:{},c:{},g:{},p:{},v:{}};
  }
  load() {
    Object.keys(this.ref).filter(file => !['t', 'v'].includes(file)).forEach(file => {
      if(!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
      if(!fs.existsSync(`${dirpath}/${file}.json`)) fs.writeFileSync(`${dirpath}/${file}.json`, JSON.stringify(this.ref[file]), 'utf-8');

      let filebuffer = fs.readFileSync(`${dirpath}/${file}.json`, 'utf-8');
      this.ref[file] = JSON.parse(filebuffer);
      if(file == 'u') {
        Object.keys(this.ref[file]).forEach(k => {
          if(this.ref[file][k].peer) delete this.ref[file][k].peer;
          if(this.ref[file][k].zzz) delete this.ref[file][k].zzz;
        });
      }
      console.log(`[${file}] data loaded!`);
    });
  }
  save() {
    for(const s of arguments) {
      fs.writeFileSync(`${dirpath}/${s}.json`, JSON.stringify(this.ref[s]), 'utf-8')
    }
  }
}
module.exports = new DevankaDatabase();