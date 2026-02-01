const mongoose = require('mongoose');
const News = require('../models/News');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UPDATES = [
    {
        titleMatch: 'Han Xin',
        newTitle: 'How to Counter Han Xin: Catching the Jumping General (2025)',
        summary: 'Han Xin stealing your jungle and towers? Learn to counter his split-pushing, invade his jungle, and lock him down with Hard CC.',
        keywords: 'Counter Han Xin HoK, Han Xin Guide, Split Push Counter',
        content: `
Han Xin is the "King of Mobility" in Honor of Kings. With three dashes on low cooldowns, he is everywhere at once: farming, ganking, and split-pushing towers. He is arguably the hardest hero to catch.

## Why is Han Xin Strong?

-   **Mobility:** Can jump over any wall. Imposible to chase.
-   **Farming Speed:** Clears jungle instantly and steals yours.
-   **Split Push:** If you group for a fight, he takes your inhibitor tower.

## Core Weaknesses

-   **Squishy:** If CC'd, he explodes.
-   **Late Game Teamfight:** He struggles in 5v5 head-on collisions. He wants skirmishes.
-   **Blue Buff Dependent:** Needs mana to spam jumps.

## Best Counter Picks

### 1. Hard CC (The Only Way)
| Hero Image | Counters Han Xin |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767609911/BlogHok/heroes/skins_splash/zhang-liang-skin-global-1.jpg) | **Zhang Liang:** Point-and-click Suppression. Han Xin jumps in, gets suppressed, dies. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606547/BlogHok/heroes/skins_splash/donghuang-skin-global-1.jpg) | **Donghuang:** The "Recall" button for Han Xin. Bite him and he is dead. |

### 2. Objectives
-   **Luna:** Can keep up with his mobility and out-duel him.
-   **Pei Qinhu:** Invades him early (Level 1) to ruin his rhythm.

## Strategic Gameplay Tips

-   **Guard Your Red/Blue:** Han Xin lives by stealing. Ward your buffs.
-   **Force Fights:** If he is split pushing top, force a hard engage 5v4 mid immediately. Take objective faster than he takes tower.
-   **Deep Wards:** Ward his jungle to track his movement.

## Essential Counter Equipment

1.  **Ominous Premonition:**
    -   *Why:* Slows his attack speed.
2.  **Sage's Sanctuary:**
    -   *Why:* Revive after his burst.
`
    },
    {
        titleMatch: 'Li Bai',
        newTitle: 'How to Counter Li Bai: Breaking the Poet\'s Flow (2025)',
        summary: 'Li Bai poking you while untargetable? Learn to deny his stacks, invade his jungle, and predict his return location.',
        keywords: 'Counter Li Bai HoK, Li Bai Guide, Anti-Assassin',
        content: `
Li Bai is a flashy assassin who relies on "stacking" his passive on minions/creeps to unlock his Ultimate (Green Lotus Sword Song). He dashes in twice, draws a circle (invulnerable), unleashes his Ult (invulnerable), and teleports back to safety.

## Why is Li Bai Annoying?

-   **Untargetable:** He is immune to damage during Skill 2 and Ultimate.
-   **Safe Poke:** He can damage you without you being able to touch him.

## Core Weaknesses

-   **Needs Stacks:** He CANNOT use his Ult without hitting something 4 times first. No minions/monsters = No Li Bai.
-   **Return Spot:** His Skill 1 leaves a shadow where he started. He usually returns there. Camp the shadow!
-   **Weak Early Game:** Pre-Level 4, he is weak.

## Best Counter Picks

### 1. Roam/Jungle
| Hero Image | Counters Li Bai |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606547/BlogHok/heroes/skins_splash/donghuang-skin-global-1.jpg) | **Donghuang:** Bite him when he dives. He cannot become untargetable if suppressed. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767607286/BlogHok/heroes/skins_splash/wukong-skin-global-1.jpg) | **Wukong:** Can burst Li Bai down before he can react or find stacks. |

## Strategic Gameplay Tips

-   **Clear the Jungle:** Don't leave small monsters near your lane. Li Bai uses them to stack his Ult. Kill everything.
-   **Camp the Shadow:** When he dashes at you, look for the white shadow he left behind. Throw your CC skills at the shadow. He will teleport back into a stun.

## Essential Counter Equipment

1.  **Spikemail:**
    -   *Why:* He deals multi-hit physical damage.
`
    },
    {
        titleMatch: 'Mulan',
        newTitle: 'How to Counter Mulan: Surviving the Blade Dancer (2025)',
        summary: 'Mulan silence combo destroying you? Learn to space against her Light Form and burst her down in Heavy Form.',
        keywords: 'Counter Mulan HoK, Mulan Guide, Clash Lane Strategy',
        content: `
Mulan is a dual-form warrior. Light Form allows for speed and silence; Heavy Form gives Damage Reduction and massive AOE control. A good Mulan flashes heavily on you, silences you, and switches forms to push you into a wall.

## Core Weaknesses

-   **No Sustain:** She has no built-in healing (unlike Cao Cao or Sun Ce). Poke her down.
-   **Skillshot Reliant:** Her Light Form Skill 2 must hit to trigger the mark.
-   **Stationary:** In Heavy form, she locks herself in animation.

## Best Counter Picks

### 1. Clash Lane
| Hero Image | Counters Mulan |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767608226/BlogHok/heroes/skins_splash/cao-cao-skin-global-1.jpg) | **Cao Cao:** He heals through her damage and out-duels her with his Ultimate. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767610562/BlogHok/heroes/skins_splash/diaochan-skin-global-1.jpg) | **Diaochan:** True damage melts Mulan through her damage reduction. |

## Strategic Gameplay Tips

-   **Buy Resistance Boots:** Reduces the silence duration.
-   **Don't Facecheck Bushes:** standard Mulan tactic is to camp a bush and 100-0 you.

## Essential Counter Equipment

1.  **Boots of Resistance:**
    -   *Why:* Reduces CC duration.
2.  **Mortal Punisher:**
    -   *Why:* Only if she uses healing rune, otherwise Spikemail is better.
`
    },
    {
        titleMatch: 'Yao',
        newTitle: 'How to Counter Yao: Breaking the Deer Shield (2025)',
        summary: 'Yao making her carry invincible? Learn how to break her shields and force her off her host.',
        keywords: 'Counter Yao HoK, Yaria Guide, Anti-Shield',
        content: `
Yao (Yaria) is a support who attaches herself to a teammate, providing a True Damage shield and firing skillshots. She is annoying because she makes fed assassins/marksmen unkillable.

## Core Weaknesses

-   **Hard CC triggers Passive:** If you CC her, she turns into a deer and becomes untargetable but harmless.
-   **Shield Breakers:** Her shield is large but breakable. Once broken, she falls off.
-   **No Peel:** Compared to Zhang Fei or Liu Shan, she offers little hard CC to stop a heavy dive.

## Best Counter Picks

-   **Galileo (Shield Breaker):** Any hero with anti-shield mechanic (rare in HoK currently, but **Lu Bu** ignores shields with True Damage).
-   **Burst Damage:** **Gan & Mo** or **Angela** can burst the shield instantly.

## Strategic Gameplay Tips

-   **Focus the Host:** Yao cannot heal the host efficiently, only shield. Poke the host down.
-   **CC The Deer:** Wait for her to re-attach.

## Essential Counter Equipment

1.  **Mortal Punisher:**
    -   *Why:* Prevents the host from healing up.
`
    },
    {
        titleMatch: 'Pei',
        newTitle: 'How to Counter Pei Qinhu: Taming the Tiger (2025)',
        summary: 'Pei Qinhu invading your jungle at Level 1? Learn to defend against his early game aggression and out-scale him.',
        keywords: 'Counter Pei Qinhu HoK, Tiger Guide, Jungle Defense',
        content: `
Pei Qinhu is a shapeshifter (Human/Tiger) who has Level 1 skills in both forms. He is the king of early game invasions.

## Core Weaknesses

-   **Falls Off:** He is an early-game tempo hero. If he doesn't snowball, he becomes a mediocre marksman late game.
-   **Short Range:** In human form, his range is short. In tiger, he is melee.

## Best Counter Picks

-   **Strong Early Junglers:** **Liu Bei** or **Sun Ce** can fight him early.
-   **Tanks:** He struggles to kill tanks.

## Essential Counter Equipment

1.  **Spikemail:**
    -   *Why:* He relies on auto-attacks.
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
