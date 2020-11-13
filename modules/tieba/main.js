const fetch = require('node-fetch');
const CryptoJS = require("crypto-js");

let tbTotal = 0;
let errConut = 0;
const BDUSS = AESDecryp('U2FsdGVkX18RzV4LogquP5BIfvAKvM9nroQiV6nPXpfdetporGfzj9NDnqoIyUhNOZj5hnDZGqUK1PJUXIpijC5m0XHfLNLZJiKLuV27AyIKpF2Uyva/QGVY755pSvn+GSyV1R88IxNqoDGeOgJxth1V0rZBtbjwTYHRM+o5rEo4g2/LcNbJcCux5aZlNIkffd/4ZE09vwDudKbAt5sESacb6LGL9g4QYhMqQ5jqjVcZc6P4qKtHTHYWh1oU82PI43Scx/YNQjN3TwOphLZJAYf7HDTwIQJgfDBs4JGuszQ=');

function toQueryString(data) {
    return Object.keys(data)
        .map((v) => `${v}=${encodeURIComponent(data[v])}`).join('&')
}

function getDataSignHash(data) {
    const dataString = Object.keys(data)
        .sort()
        .map((v) => `${v}=${data[v]}`).join('');
    return CryptoJS.MD5(dataString + 'tiebaclient!!!').toString().toUpperCase();
}

async function getTbs() {
    return await fetch('https://tieba.baidu.com/dc/common/tbs', {
        headers: {
            Cookie: 'BDUSS=' + BDUSS
        }
    }).then(async v => (await v.json())['tbs']).catch((e) => { throw `tbs获取失败: \n ${e}` });
}

async function getTbList() {
    let list = [];
    let data = {
        BDUSS: BDUSS,
        _client_type: '2',
        _client_id: 'wappc_1534235498291_488',
        _client_version: '9.7.8.0',
        _phone_imei: '000000000000000',
        from: '1008621y',
        page_no: 1,
        page_size: '200',
        model: 'MI+5',
        net_type: '1',
        timestamp: Math.round(new Date() / 1000),
        vcode_tag: '11',
    };

    data.sign = getDataSignHash(data);
    // todo 分页 
    /* while(true) { const json = */await fetch('https://tieba.baidu.com/c/f/forum/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: toQueryString(data),
    }).then(async v => {
        const json = await v.json();
        json['forum_list']['non-gconforum'].map(v => {
            list.push(v)
        });
        //return json;
    }).catch((e) => { throw `TbList获取失败: \n ${e}` })

    return list;
}

async function signTb(fid, tbs, kw) {
    const data = {
        BDUSS: BDUSS,
        fid: fid,
        tbs: tbs,
        kw: kw,
        timestamp: Math.round(new Date() / 1000),
    };
    data.sign = getDataSignHash(data);

    return await fetch('https://tieba.baidu.com/c/c/forum/sign', {
        method: 'POST',
        body: toQueryString(data)
    }).then(async v => {
        const json = await v.json();
        if (json.error_code != 0) throw '签到失败';
    }).catch(() => {
        errConut++;
    })
}

module.exports = async (Main) => {
    try {
        const tbs = await getTbs();
        const tbList = await getTbList();
        tbTotal = tbList.length;
        for (v of tbList) { 
            await signTb(v.id, tbs, v.name);
        }

        Main.log(`共签到${tbTotal}个吧, 失败${errConut}个`);
    } catch (e) {
        Main.error(e);
    }
}
