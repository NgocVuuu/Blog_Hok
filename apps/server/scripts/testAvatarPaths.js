const axios = require('axios');

async function check(url) {
    try {
        const res = await axios.head(url);
        return res.status === 200 ? 'OK' : 'ERR';
    } catch { return 'ERR'; }
}

(async () => {
    // Han Xin ID 150
    const id = 150;
    const cnJpg = `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${id}/${id}.jpg`;
    const cnPng = `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${id}/${id}.png`;
    // Another pattern often used for "head icon"
    const cnIcon = `https://game.gtimg.cn/images/yxzj/img201606/heroimg/${id}/${id}-mobileskin-1.jpg`;

    console.log(`Checking Han Xin (${id}):`);
    console.log(`JPG: ${await check(cnJpg)} -> ${cnJpg}`);
    console.log(`PNG: ${await check(cnPng)} -> ${cnPng}`);
    console.log(`Mobile: ${await check(cnIcon)} -> ${cnIcon}`);

    // Nakoruru ID 162
    const nId = 162;
    console.log(`\nChecking Nakoruru (${nId}):`);
    console.log(`JPG: ${await check(`https://game.gtimg.cn/images/yxzj/img201606/heroimg/${nId}/${nId}.jpg`)}`);
    console.log(`PNG: ${await check(`https://game.gtimg.cn/images/yxzj/img201606/heroimg/${nId}/${nId}.png`)}`);

    // Global Alessio - Check Liquipedia style
    const liqUrl = 'https://liquipedia.net/commons/images/thumb/5/52/Alessio_Showcase.png/250px-Alessio_Showcase.png'; // Guess
    // Actually we can't guess Liquipedia URLs easily without scraping. 
    // But we know scraping logic exists.
})();
