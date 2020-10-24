const Fs = require('fs');
const CryptoJS = require("crypto-js");

global.AESDecryp = (ciphertext) => {
    const decrypKey = process.argv[2];
    let bytes  = CryptoJS.AES.decrypt(ciphertext, decrypKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function getAllModules() {
    return Fs.readdirSync("./modules");
}

(async () => {
    for (let module of getAllModules()){
        let msg = await require(`./modules/${module}/main`)();
        console.log(`模块[${module}]:\n ${msg}`)
    }
})();
