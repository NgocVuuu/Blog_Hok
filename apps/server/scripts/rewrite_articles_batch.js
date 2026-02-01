const mongoose = require('mongoose');
const News = require('../models/News');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const UPDATES = [
    {
        titleMatch: 'Arke',
        newTitle: 'How to Counter Ake (Arke): Preventing the Pentakill (2025)',
        summary: 'Ake (Arke) wiping your team with resets? Learn to counter the Invisible Assassin. Weaknesses, best counter picks like Sima Yi, and positioning tips.',
        keywords: 'Counter Ake HoK, Arke Guide, Jing Ke Counter, Assassin Strategy',
        content: `
Ake (Arke), the Shadow Assassin, is the queen of "Clean-up." Her unique mechanic guarantees Critical Hits when attacking from behind (Backstab) but zero crits from the front. Her Ultimate allows her to go invisible and regenerate health. If she gets a kill or assist, all her cooldowns reset, leading to instant Pentakills.

## Why is Arke Dangerous?

-   **Reset Mechanic:** The moment she kills someone, she can instantly jump on the next target. One mistake by your teammate can wipe the whole team.
-   **Guaranteed Crits:** Her burst damage is mathematically consistent. She deletes squishies in 2 hits.
-   **Invisibility:** She regenerates health while invisible, allowing her to re-engage constantly.

## Core Weaknesses

-   **Frontal Assault:** She deals pathetic damage from the front. If you turn and face her (facecheck), she cannot crit you.
-   **Squishy:** She has no damage reduction.
-   **CC Vulnerable:** One stun usually kills her as she has to commit to melee range.

## Best Counter Picks

### 1. Mid Lane: Sima Yi & Zhang Liang
| Hero Image | Counters Arke |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767610562/BlogHok/heroes/skins_splash/sima-yi-skin-global-1.jpg) | **Sima Yi:** His Silence (Skill 2) prevents Ake from using her skills or Ultimate to escape. He bursts her faster than she bursts him. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767609911/BlogHok/heroes/skins_splash/zhang-liang-skin-global-1.jpg) | **Zhang Liang:** Suppression Ultimate. Ake jumps in -> Gets suppressed -> Dies. |

### 2. Farm Lane: Consort Yu & Di Renjie
| Hero Image | Counters Arke |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767607009/BlogHok/heroes/skins_splash/consort-yu-skin-global-1.jpg) | **Consort Yu:** Physical Immunity (Skill 2) hard counters Ake. Ake cannot damage her for 2 seconds, which is eternity in an assassin duel. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606349/BlogHok/heroes/skins_splash/di-renjie-skin-global-1.jpg) | **Di Renjie:** Skill 2 cleanses her slow/mark. His Ultimate stuns her. |

## Strategic Gameplay Tips

-   **Protect the Low HP:** Ake hunts low HP targets to trigger her reset. If you are low, recall immediately. Do not bait unless you have a GA (Guardian Angel).
-   **Face Her:** If she jumps on you, do not run away (showing your back). Turn around and fight/move backwards while facing her. Deny the backstab!

## Essential Counter Equipment

1.  **Sage's Sanctuary:**
    -   *Why:* Denies the reset. If she "kills" you but you revive, her skills DO NOT reset. She is left stranded without cooldowns.

2.  **Spikemail:**
    -   *Why:* Good armor and reflection against her rapid stabs.
`
    },
    {
        titleMatch: 'Gao Changgong',
        newTitle: 'How to Counter Gao Changgong (Lanling Wang): Seeing the Invisible (2025)',
        summary: 'The exclamation mark (!) appears and you die? Not anymore. Learn how to counter Gao Changgong with vision items, positioning tips, and the best heroes.',
        keywords: 'Counter Gao Changgong HoK, Lanling Wang Guide, Anti-Stealth',
        content: `
Gao Changgong (Prince of Lanling) is the classic "Stealth Assassin" of Honor of Kings. His kit revolves around permanent invisibility (Skill 4), allowing him to roam the map unseen and create immense psychological pressure. The moment a squishy carry sees the warning mark "!" above their head, it's usually too late.

But invisibility is his *only* trick. Once revealed, he is a fragile melee hero with no way out.

## How His Stealth Works

-   **The Warning Mark (!):** When he is invisible and near an enemy, an exclamation mark "!" appears above the enemy's head.
-   **Proximity Reveal:** If he stays too close to an enemy for 3 seconds, his stealth breaks.
-   **Attacking Breaks Stealth:** The moment he attacks, he becomes visible.

## Core Weaknesses

-   **Signaled Approach:** The "!" mark literally tells you he is coming.
-   **Weak Late Game:** He falls off incredibly hard. In 5v5 teamfights, he struggles to trade 1-for-1.
-   **Squishy:** He has no defensive skills.

## Best Counter Picks

### 1. Vision Providers
| Hero Image | Counters Gao Changgong |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606547/BlogHok/heroes/skins_splash/shouyue-skin-global-1.jpg) | **Shouyue:** Vision wards reveal invisible units. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767607698/BlogHok/heroes/skins_splash/nuwa-skin-global-1.jpg) | **Wu Zetian:** Ultimate reveals all enemies. |

### 2. Self-Protection
-   **Consort Yu:** Physical Immunity (Skill 2) negates his combo.
-   **Daji:** Auto-lock stun hits him the moment he appears.

## Strategic Gameplay Tips

-   **Respect the "!":** When the mark appears, *stop moving forward*. Retreat to your tower/tank.
-   **Group Up:** Force 5v5s. He hates grouped teams.

## Essential Counter Equipment

1.  **Sage's Sanctuary:**
    -   *Why:* He dumps his entire combo to kill you. If you revive, he has 0 energy and 0 cooldowns left.

2.  **Pure Sky:**
    -   *Why:* Active skill reduces damage taken by 35-40% to survive his burst.
`
    },
    {
        titleMatch: 'Musashi',
        newTitle: 'How to Counter Musashi: Duel of the Sword (2025)',
        summary: 'Musashi locking you down with his Ultimate? Learn to dodge his sword energy, counter-pick with True Damage, and survive his duel.',
        keywords: 'Counter Musashi HoK, Miyamoto Guide, Samurai Counter',
        content: `
Miyamoto Musashi is a balanced Fighter/Jungler known for his ability to block projectiles (Skill 1) and his "Lock-on" Ultimate. He excels at diving carries and disrupting the backline with his targeted knockup.

## Why is Musashi Strong?

-   **Projectile Block:** His Skill 1 can delete ultimate abilities like fiery arrows or mage balls.
-   **Unavoidable Engage:** His Ultimate selects a target and lands on them after a delay. You cannot Flash to dodge the lock-on (though you can Flash the landing).
-   **Constant Shields:** He gains shields continuously by using enhanced basic attacks.

## Core Weaknesses

-   **Kiteable:** Once his Ultimate is down, he has limited gap closing if he has no minions to dash through.
-   **Commitment:** He goes all in. No escape tool after using Utlimate.
-   **True Damage:** Shields are useless against True Damage.

## Best Counter Picks

### 1. The True Damage Dealers
| Hero Image | Counters Musashi |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606547/BlogHok/heroes/skins_splash/lu-bu-skin-global-1.jpg) | **Lu Bu:** Ignores Musashi's shields entirely. Lu Bu wins the melee brawl every time. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767606349/BlogHok/heroes/skins_splash/marco-polo-skin-global-1.jpg) | **Marco Polo:** High mobility allows him to dash away after Musashi lands, then kite him with True Damage. |

### 2. Magic Burst
-   **Don't pick projectile mages** (like Daji/Angela) into him if you can avoid it, as he blocks skill shots. Pick instant/beam mages like **Wang Zhaojun** or **Zhou Yu**.

## Strategic Gameplay Tips

-   **Don't Ult His Skill 1:** Wait for his blocking slash to finish before throwing important projectiles.
-   **Flash the Landing:** When he marks you with Ult, wait for him to soar into the air. The moment he starts crashing down, Flash backwards. You might still take damage, but you create distance.

## Essential Counter Equipment

1.  **Glacial Buckler:**
    -   *Why:* High cooldown reduction and armor.
2.  **Spikemail:**
    -   *Why:* He hits frequently with autos.
`
    },
    {
        titleMatch: 'Mai Shiranui',
        newTitle: 'How to Counter Mai Shiranui: Handling the Kunoichi (2025)',
        summary: 'Mai Shiranui bursting you with endless CC? Learn how to punish her energy costs, clear waves against her, and survive her combos.',
        keywords: 'Counter Mai Shiranui HoK, SNK Mage Guide, Anti-Mai Strategy',
        content: `
Mai Shiranui (SNK) is a tiered "Assassin Mage." She has immense mobility, poking power (Skill 2 Fan), and a devastating full-combo burst that can CC-lock an entire team.

## Why is Mai Strong?

-   **Manaless:** She uses Energy.
-   **Poke & Burst:** She can whittle you down with fans, then dive in for the kill.
-   **Mobility:** Every skill + passive gives her a dash.

## Core Weaknesses

-   **Wave Clear:** She has arguably the worst Level 1 wave clear of all mages. If you shove the wave, she is forced to use Energy on minions.
-   **Energy Management:** If she misses skills, she runs out of energy and cannot dash.
-   **CC Interrupts:** She is squishy. One stun mid-dash stops her combo.

## Best Counter Picks

### 1. Mid Lane
| Hero Image | Counters Mai |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767607698/BlogHok/heroes/skins_splash/mi-yue-skin-global-1.jpg) | **Miyue:** Can dodge Mai's combo with Ultimate and out-sustain her. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767610647/BlogHok/heroes/skins_splash/heino-skin-global-1.jpg) | **Heino:** Inherently tanky and can reverse time to heal back burst damage. |

### 2. Roam
-   **Donghuang:** Since Mai must dive in to deal damage, Donghuang just holds her down.

## Strategic Gameplay Tips

-   **Stand Behind Minions:** Her Fan (Skill 2) hits the first target. It doesn't pierce. 
-   **Punish Misses:** If she throws a fan and misses, she refunds no energy. Engage then.
-   **Force Wave Clear:** Push the lane hard. Make her use skills on creeps so she can't roam.

## Essential Counter Equipment

1.  **Succubus Cloak:**
    -   *Why:* Essential against her high magic burst. The shield prevents her from "one-shotting" you from a bush.
2.  **Splendor:**
    -   *Why:* Active Stasis. Press it when she flies at you.
`
    },
    {
        titleMatch: 'Shangguan',
        newTitle: 'How to Counter Shangguan (Wan\'er): Grounding the Brush (2025)',
        summary: 'Shangguan flying over your head? Stop her ascent with these hard counters, CC strategies, and item builds.',
        keywords: 'Counter Shangguan HoK, Waner Guide, Anti-Flight Strategy',
        content: `
Shangguan Wan'er is a high-skill Mage Assassin who is famous for her Ultimate "Flight." If she successfully dashes 5 times, she becomes untargetable and rains down massive damage.

## Why is Shangguan Strong?

-   **Untargetable Burst:** Once in the air, you cannot hit her.
-   **Long Range Dive:** She can start her combo from half a screen away.
-   **Roam Potential:** She moves fast and dives towers easily.

## Core Weaknesses

-   **Interruptible:** She needs to complete 5 dashes. If you CC her during the dash (before flight), her chain breaks and she is useless.
-   **Split Damage:** Her Ultimate deals damage to random nearby enemies. If 5 people stand together, the damage is split (tickles). If you are alone, you take 100% (death).
-   **No Escape:** After landing, she has no skills left.

## Best Counter Picks

### 1. Mid Lane: Zhang Liang & Heino
| Hero Image | Counters Shangguan |
| --- | --- |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767609911/BlogHok/heroes/skins_splash/zhang-liang-skin-global-1.jpg) | **Zhang Liang:** The hardest counter. Press Ult when she dashes near you. Flight cancelled. |
| ![img:medium:rectangle:center](https://res.cloudinary.com/dt0t1ayoq/image/upload/v1767610562/BlogHok/heroes/skins_splash/diaochan-skin-global-1.jpg) | **Diaochan:** Can use i-frames (Skill 2) to dodge the flight damage. |

### 2. Roam: Donghuang & Shield Supports
-   **Donghuang:** Suppression stops her dashes.
-   **Zhang Fei:** Gives shield to team to mitigate flight damage.

## Strategic Gameplay Tips

-   **Group Up:** Contrary to AOE mages, against Wan'er you want to share the damage. "Share the rain."
-   **Build Magic Defense Early:** Rush a Cloak of Magic.
-   **Stasis:** Use **Splendor**. When she flies, press the button. She does 0 damage and lands into 5 angry enemies.

## Essential Counter Equipment

1.  **Splendor (Golden Creator):**
    -   *Why:* The active skill makes you invincible/untargetable. Completely nullifies her Ultimate. Mandatory for Mages.
2.  **Succubus Cloak:**
    -   *Why:* Magic Shield.
`
    }
];

const rewriteArticles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected.');

        for (const update of UPDATES) {
            // Find by partial title match or exact match
            const article = await News.findOne({ title: { $regex: update.titleMatch, $options: 'i' } });

            if (article) {
                console.log(`Found article: ${article.title}`);
                article.title = update.newTitle;
                article.summary = update.summary;
                article.keywords = update.keywords;
                article.content = update.content;
                article.date = "2026-01-06"; // Backdate to match Jan 6 batch? Or keep Jan 11? 
                // User said "find articles written on 6/1 and 11/1 to WEITER AGAIN".
                // I will keep the creation date but maybe update publishedAt?
                // I'll leave dates alone for now, or maybe set publishedAt to now.

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
