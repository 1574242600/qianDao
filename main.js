const Fs = require('fs');
const CryptoJS = require("crypto-js");

global.AESDecryp = (ciphertext) => {
    const decryp_key = process.argv[2];
    let bytes = CryptoJS.AES.decrypt(ciphertext, decryp_key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function getAllModules() {
    return Fs.readdirSync("./modules");
}

(async () => {
    for (let module_name of getAllModules()) {
        console.log(`模块[${module_name}]开始运行:`);
        let msg = await require(`./modules/${module_name}/main`)();
        console.log(`模块[${module_name}]:\n ${msg}`);
    }
})().catch(e => {
    console.error(e)
})

