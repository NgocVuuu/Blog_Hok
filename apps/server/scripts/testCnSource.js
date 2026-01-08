const axios = require('axios');

(async () => {
    const heroId = 142; // Angela
    const url = `https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/${heroId}/${heroId}-bigskin-1.jpg`;
    console.log(`Testing URL: ${url}`);
    try {
        const res = await axios.head(url);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) console.log('SUCCESS: URL is valid image.');
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
    }
})();
