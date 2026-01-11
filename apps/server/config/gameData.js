module.exports = {
    // Official HoK / Tencent Image Sources
    images: {
        avatarBaseUrl: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg',
        skinBannerBaseUrl: 'https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info',
        // Example: https://game.gtimg.cn/images/yxzj/img201606/heroimg/105/105.jpg
    },

    // Cloudinary Folder Paths
    cloudinary: {
        avatars: 'BlogHok/heroes/avatars',
        banners: 'BlogHok/heroes/banners',
        skins: 'BlogHok/heroes/skins_splash',
        skills: 'BlogHok/heroes/skills',
    },

    // Mappings
    equipmentTiers: {
        1: 'Basic',
        2: 'Advanced',
        3: 'Epic',
        4: 'Legendary'
    },

    arcanaColors: {
        1: 'red',
        2: 'blue',
        3: 'green'
    },

    // Defaults
    defaults: {
        heroTier: 'A',
        arcanaTier: 5
    }
};
