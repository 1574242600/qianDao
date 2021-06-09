const Fs = require('fs');
const CryptoJS = require("crypto-js");
 
global.AESDecryp = (ciphertext) => {
    const decryp_key = process.argv[2];
    let bytes = CryptoJS.AES.decrypt(ciphertext, decryp_key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function getModules() {
    const modules = Fs.readdirSync("./modules");
    return modules ? modules : [];
}

class Main {
    constructor() {
        this.i = 0;
        this.errorCount = 0;
        this.modules = getModules();
    }

    async start() {
        if (this.i + 1 > this.modules.length) return ;
        this.module_name = this.modules[this.i];

        try { 
            await require(`./modules/${this.module_name}/main`)(this);
            this.log('运行完毕');
            await this.next()
        } catch (e) {
            this.error(e);
            await this.next()
        }
    }

    async next() {
        if (this.i + 1 > this.modules.length - 1) return ;
        this.i++;
        this.start();
    }

    error(msg) {
        console.error(`模块[${this.module_name}]错误:\n ${msg}`);
    }

    warn(msg) {
        console.warn(`模块[${this.module_name}]警告:\n ${msg}`);
    };

    log(msg) {
        console.log(`模块[${this.module_name}]: ${msg}`);
    }
}

(async () => {
    (new Main()).start();
})().catch(e => {
    console.error(e)
});
 
 
