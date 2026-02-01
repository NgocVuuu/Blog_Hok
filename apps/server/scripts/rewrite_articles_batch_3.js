const mongoose = require('mongoose');
const News = require('../models/News');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UPDATES = [
    {
        titleMatch: 'Nakoruru',
        newTitle: 'How to Counter Nakoruru: Grounding the Eagle (2025)',
        summary: 'Nakoruru landing on your head for 100% of your HP? Learn to survive her Bird Bomb and counter her aggressive dives.',
        keywords: 'Counter Nakoruru HoK, Nakoruru Guide, Anti-Burst Strategy',
        content: `
Nakoruru is an SNK Assassin known for her "Bird Bomb" combo. She flies over terrain (Ult), lands on a target, and deletes them instantly with Skill 1 + Skill 2.

## Why is Nakoruru Strong?

-   **Rotations:** Her flying speed allows her to gank lanes faster than most junglers.
-   **Burst:** Her kit deals % Max HP damage and massive base damage. She kills tanks and squishies alike.

## Core Weaknesses

-   **Linear:** She only has one way to go in: Fly -> Land. If you dodge the landing, she is stuck.
-   **Squishy:** She has no invulnerability or damage reduction (unlike Wukong/Li Bai).

## Best Counter Picks

### 1. Tanks with CC
| Hero Image | Counters Nakoruru |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767608226/BlogHok/heroes/skins_splash/xiang-yu-skin-global-1.jpg) | **Xiang Yu:** Damage reduction passive allows him to survive her burst. Push her away when she lands. |

### 2. Sustain Fighters
-   **Cao Cao:** Can tank her combo and heal back up.

## Strategic Gameplay Tips

-   **Spread Out:** Her landing does AOE damage. Don't let her hit 3 people at once.
-   **Watch the Bird:** When she ults, a bird icon appears on her head. Back away when you see her flying.

## Essential Counter Equipment

1.  **Sage's Sanctuary:**
    -   *Why:* Revive after the bird bomb.
2.  **Ominous Premonition:**
    -   *Why:* Tank stats.
`
    },
    {
        titleMatch: 'Xuance',
        newTitle: 'How to Counter Baili Xuance: Dodging the Hook (2025)',
        summary: 'Xuance hooking and flinging you around? Learn to dodge his hook, cleanse his CC, and disrupt his reset mechanic.',
        keywords: 'Counter Xuance HoK, Xuance Guide, Anti-Hook Strategy',
        content: `
Baili Xuance (The Crazy Brother) is a mechanical jungler who relies on his "Hook" (Skill 2). If he lands the hook, he can fling you behind him and kill you. If he gets a kill/assist, he enters "Hyper Mode" (Attack Speed/Move Speed boost).

## Core Weaknesses

-   **Hook Reliant:** If he misses the hook, he is just a minion.
-   **CC Cleanse:** Purifying the hook renders him useless.
-   **Squishy:** He needs to get close to deal damage.

## Best Counter Picks

| Hero Image | Counters Xuance |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606349/BlogHok/heroes/skins_splash/di-renjie-skin-global-1.jpg) | **Di Renjie:** Skill 2 cleanses the hook immediately. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606547/BlogHok/heroes/skins_splash/zhuangzi-skin-global-1.jpg) | **Zhuangzi:** Ultimate cleanses the whole team. Xuance cannot control anyone. |

## Strategic Gameplay Tips

-   **Dodge the Hook:** It has a charge-up time. Sidestep it.
-   **Don't Feed his Passive:** He needs a kill to go crazy. Play safe when low HP.

## Essential Counter Equipment

1.  **Boots of Resistance:**
    -   *Why:* Reduces control duration.
`
    },
    {
        titleMatch: 'Athena',
        newTitle: 'How to Counter Athena: Stopping the Infinite Dash (2025)',
        summary: 'Athena dashing through your whole team? Learn to break her rhythm and steal her blue buff.',
        keywords: 'Counter Athena HoK, Athena Guide',
        content: `
Athena is a warrior/jungler who can dash infinitely as long as she hits her Skill 2 (Spear) on targets. She has shields, immunity, and high burst.

## Core Weaknesses

-   **Blue Buff Dependent:** She consumes mana incredibly fast. No Blue = No Dashes.
-   **CC Rhythm:** Hard CC stops her combo.

## Best Counter Picks

-   **Donghuang:** Suppression stops her dancing.
-   **Zhang Liang:** Same.

## Strategic Gameplay Tips

-   **Invade Blue:** Every game against Athena, invade her Blue.
-   **Don't Group for Her Ult:** Her shield explodes for damage. Walk away when she erects the giant shield.

## Essential Counter Equipment

1.  **Spikemail:**
    -   *Why:* She hits many times.
`
    },
    {
        titleMatch: 'Jing',
        newTitle: 'How to Counter Mirror (Jing): Shattering the Glass (2025)',
        summary: 'Jing flying everywhere in her circle? Learn to counter the Mirror with hard CC and patience.',
        keywords: 'Counter Jing HoK, Mirror Guide',
        content: `
Jing (Mirror) is a high-skill assassin. Her Ultimate creates a mirror field where she can dash infinitely between her clone and herself, dealing massive damage and becoming nearly untargetable.

## Why is Jing Strong?

-   **Infinite Mobility (in Ult):** Inside her circle, she is god.
-   **Burst:** Deletes squishies instantly.

## Core Weaknesses

-   **The Circle:** She is only strong INSIDE her Ultimate.
-   **Squishy:** Outside Ult, she is weak.

## Best Counter Picks

| Hero Image | Counters Jing |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767609911/BlogHok/heroes/skins_splash/zhang-liang-skin-global-1.jpg) | **Zhang Liang:** Hold her down. She stops moving, she dies. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606547/BlogHok/heroes/skins_splash/donghuang-skin-global-1.jpg) | **Donghuang:** The universal answer. |

## Strategic Gameplay Tips

-   **Leave the Circle:** When she ults, literally just walk out of the circle. Wait for the mirror to break (duration ends), then re-engage. Do not fight her inside her domain.
-   **Tank the Clone:** Tanks should stand between Jing and her target to block the path? No, just leave the circle.

## Essential Counter Equipment

1.  **Sage's Sanctuary:**
    -   *Why:* Survive the initial burst.
`
    }
];

const rewriteArticles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected.');

        for (const update of UPDATES) {
            const article = await News.findOne({ title: { $regex: update.titleMatch, $options: 'i' } });

            if (article) {
                console.log(`Found article: ${article.title}`);
                article.title = update.newTitle;
                article.summary = update.summary;
                article.keywords = update.keywords;
                article.content = update.content;
                article.date = "2026-01-06";
                await article.save();
                console.log(`Updated: ${update.newTitle}`);
            } else {
                console.log(`Article not found for: ${update.titleMatch}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
};

rewriteArticles();
