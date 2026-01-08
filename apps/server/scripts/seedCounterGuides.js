const mongoose = require('mongoose');
const News = require('../models/News');
const Hero = require('../models/Hero');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GUIDES = [
    {
        heroName: 'Lam',
        title: 'How to Counter Lam (Shark): The Ultimate Guide (2025)',
        summary: 'Is Lam dominating your ranked games? Learn how to shut down the "Shark" with hard counters, core items like Mortal Punisher, and strategic tips to ruin his day in Honor of Kings.',
        keywords: 'Counter Lam HoK, Lam Guides, Honor of Kings Lam Counter, Anti-Health Items, Lam Weaknesses',
        content: `
Lam (also known as the Shark) is one of the most terrifying Junglers in Honor of Kings. With his sleek mobility, ability to dive into the ground, and devastating area-of-effect (AOE) damage, a farmed Lam can single-handedly wipe out an entire backline. His signature ability to "swim" through terrain makes him elusive, while his ultimate drags victims together for a quick team wipe.

However, even the fiercest predator has a weakness. If you know how to draft, build, and play against him, Lam goes from a "Shark" to a harmless "Goldfish." This comprehensive guide will teach you everything you need to know to counter Lam in the 2025 meta.

## Why is Lam So Dangerous?

Before we talk about countering him, let's understand why he is banned so often in high-elo games:

1.  **Infinite Sustain:** His passive and Skill 2 allow him to heal significantly during fights. If he isn't burst down or anti-healed, he can sustain through an entire team's damage.
2.  **Unmatched Mobility:** In his "Shark" form (Skill 1), he moves faster and can dive underground, making him hard to target and allowing him to flank from unexpected angles.
3.  **Teamfight Disruption:** His Ultimate (Death from Below) drags enemies in its path to a destination. This is a nightmare for squishy carries who clump together, as it sets up perfect combos for his teammates.
4.  **Low Cooldowns:** In the late game, his Skill 2 resets constantly if he hits multiple targets, giving him immense DPS.

## Core Weaknesses

Lam is not invincible. Here are his biggest vulnerabilities:

-   **Weak to Hard Crowd Control (CC):** Lam relies on fluid movement and continuous casting. Hard CC like Stuns, Silences, or Suppression (Donghuang/Zhang Liang) stops him dead in his tracks. Once he stops moving, he dies.
-   **Vulnerable When Abilities are on Cooldown:** If Lam misses his Skill 2 or engages without his Ultimate, his damage output drops significantly.
-   **Requires Close Range:** He is a melee assassin. He must commit his body to deal damage. This makes him vulnerable to AOE control aimed at his feet.
-   **Anti-Heal Destroys Him:** A huge part of his tankiness comes from lifesteal/healing. Cutting this by 50% makes him squishy.

## Best Counter Picks

Drafting is 50% of the battle. Pick these heroes to ruin Lam's day:

### 1. Mid Lane: Diaochan & Zhang Liang
-   **Diaochan:** She loves melee enemies who dive her. Her passive deals true damage and slows movement, which cripples Lam. Her Ultimate allows her to dance around him, often out-sustaining his damage. If Lam dives a good Diaochan, he usually ends up frozen and dead.
-   **Zhang Liang:** The ultimate anti-assassin. His Ultimate (Suppression) cannot be cleansed. As soon as Lam dives in, Zhang Liang can hold him in place for 2+ seconds, allowing the team to burst him down easily.

### 2. Roam/Support: Donghuang & Liu Shan
-   **Donghuang:** Similar to Zhang Liang, Donghuang's Ultimate is a suppression. He can bite Lam under the tower or in the middle of a teamfight. It's the hardest counter in the game.
-   **Liu Shan:** Provides a chain of heavy CC (Knockup and Stun). He can peel for his marksman effectively, interrupting Lam's combos repeatedly.

### 3. Farm Lane: Consort Yu & Marco Polo
-   **Consort Yu:** Her Skill 2 grants immunity to physical damage for 2 seconds. This is enough to negate Lam's entire burst combo. She can then use her Ultimate to create distance and kite him.
-   **Marco Polo:** Highly mobile. He can dash away from Lam's engage and use his True Damage to melt Lam, who often builds semi-tanky items like Ominous Premonition.

### 4. Clash Lane: Arthur
-   **Arthur:** A simple but effective counter. His Skill 1 causes Silence, preventing Lam from casting abilities. Lam without abilities is a sitting duck. Plus, Arthur is too tanky for Lam to burst down.

## Strategic Gameplay Tips

### Early Game
-   **Invade His Jungle:** Lam is relatively weak before Level 4. Organizing a Level 1 invade on his Blue Buff can set him behind significantly.
-   **Watch the River:** Lam loves to rotate via the river for the speed boost. Keep vision on the river bush to avoid surprise ganks.

### Mid Game
-   **Don't Clump Up:** This is crucial. If your team stands tied together, Lam's Ultimate will hit everyone. Spread out slightly so he can only target one person at a time.
-   **Wait for His Dive:** Don't panic when you see the Shark fin. Wait for him to emerge and commit. Once he uses his dash/dive, throw your CC immediately.

### Late Game
-   **Protect the Carry:** Support players should save their peel specifically for Lam. Do not use your CC on their tank frontline. Wait for Lam.
-   **Vision Control:** Lam wants to flank. Good vision setup prevents him from finding a winning angle.

## Essential Counter Equipment (HoK Only)

Building correctly is mandatory against Lam. Do not autopilot your build!

1.  **Mortal Punisher (for Marksman/Warrior):**
    -   *Why:* Reduces enemy health recovery by 50%. This cuts Lam's survivability in half. Rush this as your 2nd or 3rd item.

2.  **Venomous Staff (for Mages):**
    -   *Why:* The magical equivalent of Mortal Punisher. Applies anti-heal on ability hits. Essential for Mid laners.

3.  **Spikemail:**
    -   *Why:* Lam deals physical damage and hits frequently. Spikemail reflects damage back to him and provides high Armor. Great for Tanks/Warriors.

4.  **Ominous Premonition:**
    -   *Why:* Reduces the attacker's Attack Speed and Movement Speed. This messes up Lam's combo fluidity and makes him stick to you less effectively.

5.  **Sine: Sage's Sanctuary:**
    -   *Why:* Grants a resurrection. Since Lam relies on resets and quick kills, reviving mid-fight can ruin his momentum and leave him without cooldowns in the middle of your team.

## Conclusion

Lam is a "pub stomper" who thrives on chaos and lack of coordination. By picking heavy CC heroes like **Donghuang** or **Zhang Liang**, building **Mortal Punisher** early, and spreading out in teamfights, you remove his teeth.
Remember: A shark that can't move is just seafood. Good luck on the battlefield!
    `
    },
    {
        heroName: 'Wukong',
        title: 'How to Counter Wukong (Monkey King): Stop The One-Shot (2025)',
        summary: 'Wukong destroying your team with lucky crits? Discover the best strategies to counter the Monkey King in Honor of Kings. Top hero picks, vision control, and defensive items like Spikemail.',
        keywords: 'Counter Wukong HoK, Monkey King honor of kings guide, Wukong Weakness, Anti-Crit Build',
        content: `
Wukong, the Monkey King, is perhaps the most popular Jungler in lower and mid-tier ranks of Honor of Kings. His kit is simple but deadly: go invisible, jump on a carry, smash them with a critical hit, and disappear. A fed Wukong feels unfair to play against because he can delete a squishy hero in less than a second.

However, Wukong relies heavily on "all-in" bursts and RNG (Random Number Generation) critical hits early on. He is very counterable if you survive his initial jump. This guide breaks down exactly how to tame the Monkey.

## Why is Wukong So Strong?

1.  **Insane Burst Damage:** His passive empowers his next auto-attack after using a skill, dealing massive damage. Combined with critical hit items like **Endless Force**, he can 2-shot most non-tank heroes.
2.  **Slippery Mobility:** Skill 2 (Combat Somersault) is a great gap closer and escape tool.
3.  **Invincibility Frame:** His Skill 1 (Protective Spell) blocks an ability and grants a shield/invincibility for a split second, allowing skilled Wukong players to block crucial CC like Daji's stun.
4.  **Stealth Mechanics:** He can approach unseen, reducing your reaction time.

## Core Weaknesses

-   **Very Item Dependent:** Wukong is weak in the early game. He needs at least 2-3 critical items (Master Sword, Endless Force) to come online. If you shut him down early, he struggles to recover.
-   **Squishy:** He builds full damage. If he gets caught by CC, he dies instantly.
-   **Single Target Focus:** He excels at deleting one person. He struggles against grouped teams or tanky lineups.
-   **Predictable Pattern:** Engage -> Smash -> Skill -> Smash. Once his skills are on cooldown, he is helpless.

## Best Counter Picks

### 1. Mid Lane: Angela & Xiao Qiao
-   **Angela:** While risky, if Angela lands her stun (Skill 2) when Wukong jumps in, she can melt him with her Ultimate before he can swing his staff. She also gains a massive shield during her Ult.
-   **Xiao Qiao:** Her Skill 2 (Knockup) is instant if placed under herself. When Wukong jumps on you, cast Skill 2 at your feet immediately. He will be knocked up, and you can burst him or run.

### 2. Jungle/Clash Lane: Liu Bei & Athena
-   **Liu Bei:** Wukong's nightmare. Liu Bei is tanky, deals high close-range damage, and his Ultimate grants immunity to CC and a massive shield. Wukong cannot burst through Liu Bei's shield, and Liu Bei wins every 1v1 duel.
-   **Allain:** In Clash Lane, Allain destroys Wukong. Allain's damage reduction and frequent knockups make it impossible for Wukong to trade effectively.

### 3. Roam: Liu Shan & Donghuang
-   **Liu Shan:** Provides endless CC. He can stun Wukong repeatedly, preventing him from utilizing his enhanced auto-attacks.
-   **Donghuang:** The universal assassin counter. Bite him with Ultimate, and let the tower or team kill him.

### 4. Farm Lane: Consort Yu
-   **Consort Yu:** The absolute best ADC against Wukong. Her Skill 2 makes her immune to ALL physical damage for 2 seconds. Wukong deals only physical damage. He literally deals 0 damage to her while she kills him.

## Strategic Gameplay Tips

### Early Game
-   **Punish His Jungle:** Wukong has a slow clear speed compared to meta junglers. Invade his jungle early. Stealing his blue buff hurts him immensely as he is mana-hungry.
-   **Check Bushes:** Wukong loves to camp bushes ("Bush Wukong"). Use long-range skills to check bushes before walking near them.

### Mid Game
-   **Track His Position:** If you don't see Wukong on the map, assume he is flanking you. Hug your tower or your support.
-   **Bait the Shield:** Try to force out his Skill 1 (Protective Spell) with a minor ability before committing your main CC.

### Late Game
-   **Group Up:** Wukong hates 5v5 teamfights where enemies are grouped. He cannot jump in without exploding.
-   **Focus Fire:** As soon as he appears, ping him and focus him. Even a late-game Wukong dies in 0.5 seconds to focus fire.

## Essential Counter Equipment (HoK Only)

1.  **Spikemail:**
    -   *Why:* The single best item against Wukong. High physical defense + damage reflection. If a Mage or ADC builds just a **Guardian's Glory** (component) or full Spikemail, Wukong's kill threshold increases significantly.

2.  **Sage's Sanctuary:**
    -   *Why:* Wukong blows all his cooldowns to kill you. If you revive, he has nothing left and is sitting duck.

3.  **Ominous Premonition:**
    -   *Why:* The slow effect reduces his attack speed and movement, making it harder for him to chase or execute consecutive smashes.

4.  **Moon Goddess (Active Item):**
    -   *Why:* Use the active stasis (Zhonyas style) when he jumps. He wastes his combo on an invulnerable target, and your team cleans him up.

## Conclusion

Wukong is a "knowledge check" hero. If you respect his burst, build some armor (even on carries), and pick **Consort Yu** or **Liu Bei**, the Monkey King becomes nothing more than a circus act. Don't let him farm freely, and you will win.
    `
    },
    {
        heroName: 'Shouyue',
        title: 'How to Counter Shouyue (Bai Li): Dealing with the Sniper (2025)',
        summary: 'Tired of getting sniped from across the map by Shouyue? Learn the best strategies, counter picks like Sun Ce and Consort Yu, and macro tips to neutralize Honor of Kings\' most annoying marksman.',
        keywords: 'Counter Shouyue HoK, Bai Li Shouyue Guide, Anti-Sniper Strategy, Honor of Kings Marksman Counter',
        content: `
Shouyue (Bai Li Shouyue) is one of the most polarizing heroes in Honor of Kings. A good Shouyue can oppress a lane completely, taking 40% of your HP with a single bullet from miles away. His vision wards (Skill 1) make him nearly ungankable, and his camouflage makes him slippery.

Beating Shouyue requires patience, map awareness, and decisiveness. You cannot play a "standard" game against him; you must adapt your playstyle tohunt the hunter.

## Why is Shouyue Annoying?

1.  **Long-Range Poke:** His Skill 2 (Snipe) has incredible range and damage. He can soften up your team before a fight even starts.
2.  **Vision Contro:** His Skill 1 places "eyes" (wards) that grant vision. He can see you coming, making ganks very hard.
3.  **Camouflage:** Near terrain, he becomes invisible and moves faster, allowing for sneaky rotations.
4.  **Self-Peel:** His Ultimate allows him to jump back and fire a shot, saving him from dive attempts.

## Core Weaknesses

-   **Low Sustained DPS:** Unlike typical marksmen (like Hou Yi), Shouyue attacks slowly. If he misses his snipes, his damage contribution in a teamfight is very low.
-   **Terrible Teamfighter:** He struggles in chaotic 5v5 fights where he can't sit back and aim.
-   **No Hard Mobility:** Aside from his Ultimate (long cooldown), he has no dash. If you catch him without Ult, he is dead.
-   **Vision can be cleared:** His eyes can be destroyed by standing on them.

## Best Counter Picks

### 1. Farm Lane: Consort Yu & Lady Sun
-   **Consort Yu:** The ultimate counter. Use Skill 2 (Physical Immunity) when you hear his snipe charging or see the red line. You will take 0 damage. Then simply walk up and kill him with your superior attack speed.
-   **Lady Sun:** She is mobile enough to dodge snipes with her roll (Skill 1) and can burst him down quickly if she gets in range.

### 2. Clash/Jungle: Sun Ce & Nezha
-   **Sun Ce:** Shouyue cannot snipe if a boat is crashing into his face. Sun Ce's Ultimate allows him to travel across the map and engage Shouyue from long range. The CC chain ensures Shouyue dies before he can Ult away.
-   **Nezha:** His Ultimate locks onto Shouyue and flies directly to him, revealing his location (even in camo). There is no escape for Shouyue against Global threat.

### 3. Mid Lane: Nuwa & Simayi
-   **Nuwa:** She can block his escape paths with boxes and out-range him with her Ultimate.
-   **Sima Yi:** Can dive extremely deep into the backline. Being a Magic Assassin, he bypasses Shouyue's physical reliance and silence him instantly.

## Strategic Gameplay Tips

### Early Game
-   **Clear the Wards:** This is priority #1. If you see a ward circle on the ground, stand on it for 2 seconds to destroy it. Do this whenever it is safe. Denying his vision opens him up to ganks.
-   **Unpredictable Movement:** Never walk in a straight line. Zig-zag constantly, stop abruptly, and move erratically. Make it headache-inducing for him to aim.
-   **Hide Behind Minions:** While his bullet penetrates, damage is reduced after hitting objects (minions).

### Mid/Late Game
-   **Hard Engage:** Do not poke against a poke comp. Use "Hard Engage" tools (like Sun Ce boat, Luban No.7 master) to force a fight immediately. Shouyue hates being rushed.
-   **Flank Him:** He will be standing far behind his team. Assign an assassin (like Monkey King or Musashi) to flank and take him out specifically.

## Essential Counter Equipment (HoK Only)

1.  **Guardian's Glory / Ominous Premonition:**
    -   *Why:* High physical defense reduces the chunk damage from his snipes.

2.  **Physical Lifesteal Items (Bloodweeper):**
    -   *Why:* If he pokes you, you need to heal up quickly on a minion wave so you don't have to recall.

3.  **Lightfoot Shoes (Boots of Dexterity):**
    -   *Why:* While usually for roaming, the high movement speed helps in dodging snipes. However, **Boots of Resistance** (Magic def usually) or pure Armor boots are safer to reduce damage. Actually, **Boots of Fortitude** (Armor Boots) are best here.

## Conclusion

Shouyue is a psychological test. If you get frustrated and tilt, you lose. If you pick **Consort Yu**, clear his wards diligently, and force hard engagements, he becomes a liability to his team.
Be aggressive. Don't let him play aim-training simulator!
    `
    },
    {
        heroName: 'Cirrus',
        title: 'How to Counter Cirrus (Yun Zhong Jun): Grounding the Bird (2025)',
        summary: 'Cirrus flying over walls and stealing your jungle? Here is the complete guide to countering Cirrus in Honor of Kings. Learn his energy mechanic, best counter picks, and how to force him to land.',
        keywords: 'Counter Cirrus HoK, Yun Zhong Jun Guide, Anti-Fly Strategy, Jungle Counter',
        content: `
Cirrus (Yun Zhong Jun) occupies a unique niche in Honor of Kings: he is the only hero who can fly over terrain permanently (as long as he has Energy/Breath). This allows him to path in ways no other jungler can, invading buffs and ganking from literal walls.

However, Cirrus is extremely reliant on his "Flight Mode." If he loses it, he becomes a "walking chicken" — slow, weak, and useless. Understanding how to ground him is the key to victory.

## Understanding His Mechanic (Breath/Energy)

-   **Flight Mode:** Cirrus flies, ignores terrain, gains simple movespeed, and his attacks cause bleeding.
-   **Walking Mode:** When his Energy bar (Breath) runs out, he lands. He cannot fly over walls, loses range, and cannot use his Dive skill effectively.
-   **How he loses Energy:** Entering combat stops energy regeneration. Taking damage doesn't drain it instantly, but if he cannot hit enemies to generate energy, it naturally depletes.

## Core Weaknesses

-   **Weak when Grounded:** If he lands in a teamfight, he is dead. He has no escape mechanism on the ground.
-   **Susceptible to Kiting:** If you keep him at arm's length so he can't claw you (refresh energy), he will eventually be forced to land.
-   **Weak against Invulnerability:** Heroes who can become untargetable (Miyue, Consort Yu) waste his precious flight time.

## Best Counter Picks

### 1. Mid Lane: Chang'e (Fatih) & Zhang Liang
-   **Chang'e:** Being a "Mana Tank," she is incredibly durable. Cirrus relies on rapid clawing attacks, but Chang'e can simply stand there, absorb the damage, and nuke him. She is too tanky for him to burst.
-   **Zhang Liang:** Suppression Ultimate. Cirrus flies in -> Gets Supressed -> Dies. Simple and effective.

### 2. Jungle: Wukong & Nakroth
-   **Wukong:** Wukong's burst is faster than Cirrus's bleed. A 3-tap combo usually deletes the bird before he can stack up damage.
-   **Nakroth:** Extremely mobile. Nakroth can dash away when Cirrus engages, waiting for Cirrus's energy to drop, then re-engage to finish him off.

### 3. Roam: Donghuang & Yaria
-   **Donghuang:** The ultimate "No Fly Zone." Flash + Ultimate on Cirrus shuts him down completely.
-   **Yaria:** Her shield protects the carry from the initial dive, and her CC can annoy him.

## Strategic Gameplay Tips

### Early Game
-   **Guard Your Jungle:** Cirrus *will* invade at Level 1 because he flies over walls to reach your Blue Buff faster than you can. Stack 3-4 people at the buff entrance to welcome him. If he fails the Level 1 invade, his snowball potential is halved.
-   **Don't Fight Him 1v1 Early:** His bleeding effect deals massive damage early game.

### Mid/Late Game
-   **Drag Out Fights:** Cirrus wants quick burst fights. If you can disengage (run away) when he activates his Skill 1 acceleration, his energy will deplete. Turn and fight once he lands.
-   **Spread Out:** His Ultimate causes a falling AOE knockup. Don't present a perfect target for him.

## Essential Counter Equipment (HoK Only)

1.  **Spikemail:**
    -   *Why:* Cirrus attacks rapidly to maintain energy. Spikemail reflects damage on every hit. He will kill himself attacking you.

2.  **Mortal Punisher / Venomous Staff:**
    -   *Why:* He has built-in sustain. Anti-heal is necessary.

3.  **Frozen Breath (for Mages):**
    -   *Why:* The slow effect and tank stats make it harder for him to stick to you, potentially forcing him to run out of flight energy.

## Conclusion

Countering Cirrus is all about **energy management** (his energy, not yours). Deny his early invade, draft heroes with suppression or high durability like **Chang'e**, and build **Spikemail**. Once you clip his wings, he's just a free kill.
    `
    },
    {
        heroName: 'Feyd',
        title: 'How to Counter Prince of Lanling (Feyd): Seeing the Invisible (2025)',
        summary: 'The exclamation mark (!) appears and you die? Not anymore. Learn how to counter Feyd (Lanling Wang) with vision items, positioning tips, and the best heroes to survive his assassination attempts.',
        keywords: 'Counter Feyd HoK, Lanling Wang Guide, Prince of Lanling Counter, Anti-Stealth',
        content: `
Feyd (Prince of Lanling / Lanling Wang) is the classic "Stealth Assassin" of Honor of Kings. His kit revolves around permanent invisibility (Skill 4), allowing him to roam the map unseen and create immense psychological pressure. The moment a squishy carry sees the warning mark "!" above their head, it's usually too late.

But invisibility is his *only* trick. Once revealed, Feyd is a fragile melee hero with no way out. Here is how to survive the hunt.

## How His Stealth Works

-   **The Warning Mark (!):** When Feyd is invisible and near an enemy, an exclamation mark "!" appears above the enemy's head.
-   **Proximity Reveal:** If he stays too close to an enemy for too long (approx 3 seconds), his stealth breaks automatically.
-   **Attacking Breaks Stealth:** The moment he uses a skill or attack, he becomes visible.

## Core Weaknesses

-   **Signaled Approach:** The "!" mark literally tells you he is coming.
-   **Weak Late Game:** Feyd falls off incredibly hard. In 5v5 teamfights, he struggles to trade 1-for-1.
-   **Squishy:** He has no defensive skills. If CC'd, he dies instantly.
-   **Vision Items:** Specific skills and items can reveal him.

## Best Counter Picks

### 1. Farm Lane: Di Renjie & Consort Yu
-   **Di Renjie:** His Skill 2 removes CC and grants invincibility frames. If timed right when Feyd throws his dagger (Skill 2), Di Renjie cleanses the slow/stun and can turn around to stun Feyd with his Yellow Token (Ult).
-   **Consort Yu:** Physical Immunity (Skill 2) completely negates Feyd's combo.

### 2. Roam: Elsu (Support/Mid) & Wolf (Guiguzi)
-   **Shouyue (Elsu):** Placing vision wards reveals invisible units. If Feyd walks over a ward, he is seen.
-   **Guiguzi:** His Ultimate grants vision of the nearest enemy, revealing Feyd to the whole team.

### 3. Mid Lane: King of Glory (Wu Zetian) & Daji
-   **Wu Zetian:** Her Ultimate reveals all enemies on the map and stuns them. It's the ultimate counter to stealth.
-   **Daji:** Her Skill 2 (Stun) is auto-lock. If the "!" appears, Daji just mashes Skill 2. As soon as Feyd appears to attack, the heart flies out and stuns him immediately.

## Strategic Gameplay Tips

### Survival 101
-   **Respect the "!":** When the mark appears, *stop moving forward*. Retreat immediately to your tower or hug your tank. Do not face check the bush or keep farming.
-   **Protect the Carry:** Tanks should stand *on top* of their ADC when the mark appears to body block Feyd's Skill 2 (Dagger).

### Teamfighting
-   **Force 5v5:** Feyd wants chaotic skirmishes. Force group fights down mid lane. He cannot approach a grouped team without being blown up by AOE.
-   **Invade Blue:** He needs Mana and CDR. Stealing his blue buff cripples his roaming capability.

## Essential Counter Equipment (HoK Only)

1.  **Sage's Sanctuary:**
    -   *Why:* Feyd is a "one-trick pony." He dumps his entire combo to kill you. If you revive, he has 0 energy and 0 cooldowns left. You wake up and kill him.

2.  **Pure Sky:**
    -   *Why:* Active skill reduces damage taken by 35-40% (depending on patch) for a short duration and usable while CC'd. Pop this when the mark appears or when he stuns you to survive the burst.

3.  **Glacial Buckler:**
    -   *Why:* High armor and CDR. Good for Mages/Supports to survive the initial burst.

## Conclusion

Feyd preys on fear and isolation. To beat him, you simply need to **group up** and protect your carries. If you deny him kills in the first 8 minutes, he becomes a minion in the late game.
See the **!**? Run to your friends!
    `
    },
    {
        heroName: 'Ukyo Tachibana',
        title: 'How to Counter Ukyo Tachibana: Beating the Samurai (2025)',
        summary: 'Struggling against Ukyo\'s poke and stun? Learn the spacing techniques and hero picks needed to counter Ukyo Tachibana in the Clash Lane and Jungle.',
        keywords: 'Counter Ukyo Tachibana HoK, Ukyo Guide, SNK Hero Counter, Anti-Poke Strategy',
        content: `
Ukyo Tachibana is an SNK guest hero who excels at mid-range skirmishing. He is a lane bully in the Clash Lane and a fast-clearing Jungler. His kit revolves around his Passive (Iaijutsu - a long-range slash) and his Skill 2 (Knockstun). He kites melee heroes to death while bursting squishies.

He is annoying because he hits you from a distance where you can't hit back. Here is how to close the gap and defeat him.

## Why is Ukyo Strong?

1.  **Free Poke:** His passive allows him to slash from a safe distance every 5 seconds, slowing enemies.
2.  **Instant CC:** His Skill 2 is a fast, medium-range stun.
3.  **Mobility:** Skill 1 (Concealed Saber) gives him two dashes (if the first one hits something), allowing for "in-and-out" plays.
4.  **Sustain:** His Ultimate roots him but deals massive damage and heals him significantly.

## Core Weaknesses

-   **Stationary Ultimate:** When he uses Ultimate, he cannot move. This makes him a sitting duck for skill shots (like Diaochan Freeze or Hou Yi Arrow).
-   **Skill Shot Reliant:** If he misses Skill 2 (Stun), he loses half his threat.
-   **Falls Off Late Game:** He is an early-mid game hero. In late game 5v5s, he struggles to enter the fight without blowing up.
-   **Squishy:** Despite being a warrior, he builds mostly damage.

## Best Counter Picks

### 1. Clash Lane: Sun Ce, Charlotte, & Allain
-   **Sun Ce:** High CC and engaging tool. Ukyo wants to kite backwards; Sun Ce crashes a boat into him and locks him down.
-   **Charlotte:** Her damage reduction and sticky playstyle (Seven Stars sword) make it impossible for Ukyo to kite her. She thrives in prolonged duels where Ukyo fails.
-   **Allain:** Can stick to Ukyo effortlessly. His Ultimate makes him untargetable, dodging Ukyo's burst, then landing to finish him.

### 2. Jungle: Kaizer & Butterfly
-   **Kaizer:** In a 1v1, the "Duelist" King wins. Ukyo's poke tickles Kaizer's sustain, and once Kaizer ults, Ukyo dies in 3 hits.

### 3. Mid Lane: Wang Zhaojun
-   **Wang Zhaojun:** Her passive shield blocks poke damage. Her Ultimate zones Ukyo out. If Ukyo uses his Ult (standing still), Wang Zhaojun simply freezes him (Skill 2) easily.

## Strategic Gameplay Tips

-   **Sidestep Skill 2:** Ukyo's stun hits in a narrow line. Move perpendicular (sideways) to him, not straight back. Dodging this stun wins you the trade.
-   **Interrupt the Ult:** Save your hard CC (Stun/Knockup) for his Ultimate. The moment he starts slashing/healing, stun him. It cancels the ability completely.
-   **Engage When Passive is Down:** Watch his sword. If it glows/sheathed, he has his passive slash ready. Wait for him to use it on a minion, then engage.

## Essential Counter Equipment (HoK Only)

1.  **Mortal Punisher:**
    -   *Why:* Ukyo heals a LOT from his Ultimate. Anti-heal is required if he is fed.

2.  **Spikemail:**
    -   *Why:* He deals pure physical AD. Spikemail reflects it and mitigates his poke.

3.  **Boots of Fortitude:**
    -   *Why:* The flat armor and physical damage reduction from auto-attacks helps against his passive poke.

## Conclusion

Ukyo Tachibana relies on you being afraid of his reach. Don't let him bully you. Pick "sticky" heroes like **Charlotte** or **Sun Ce** who can close the gap and force a melee brawl. Once you get in his face, the Samurai has nowhere to run.
    `
    },
    {
        heroName: 'Zilong',
        title: 'How to Counter Zilong (Zhao Yun): Dragon Slayer Guide (2025)',
        summary: 'Zhao Yun (Zilong) diving your backline? Learn how to counter this tanky assassin. Tips on dodging his Ultimate, best counter items, and hero matchups.',
        keywords: 'Counter Zilong HoK, Zhao Yun Guide, Honor of Kings Zilong Counter, Anti-Diver Strategy',
        content: `
Zilong (Zhao Yun) is the archetypal "Diver" in Honor of Kings. He is a beginner-friendly jungler who is surprisingly effective at all ranks. His motto is simple: see carry, press Ultimate (Thunder), kill carry. His passive makes him tankier as he loses health, making him deceptively hard to kill.

However, Zilong is extremely linear (literally). His attack pattern is predictable.

## Core Weaknesses

-   **Telegraphed Ultimate:** His Ultimate has a wind-up animation and a visible indicator. It can be dodged with Flash or mobility skills.
-   **Short Range:** Outside of his Ultimate, he has very short range. He needs to stick to targets.
-   **No Escape After Commit:** Once he uses Skill 1 and Ult to go in, he has no way out. If he fails to kill, he dies.
-   **Dependent on Blue Buff:** He spams skills constantly. Without Blue, he runs out of mana fast.

## Best Counter Picks

### 1. Mid Lane: Diaochan
-   **Diaochan:** The absolute hardest counter. Zilong dives in -> Diaochan uses Skill 2 (Invincibility frame) to dodge the knockup -> Diaochan pops Ult and dances. Zilong cannot run away and becomes a slow-moving target dummy for her true damage.

### 2. Roam: Zhuangzi & Dolphin (Sun Bin)
-   **Zhuangzi:** His Ultimate cleanses all CC for the team. When Zilong lands his big knockup, Zhuangzi presses Ult, and the team walks away (or kills Zilong).
-   **Sun Bin (Dolphin):** His Skill 2 gives massive speed boost and refunds damage taken. This nullifies Zilong's initial burst.

### 3. Jungle: Han Xin & Nakroth
-   **Han Xin:** Way more mobile than Zilong. He can invade Zilong's jungle, steal camps, and jump over walls where Zilong can't follow easily.

## Strategic Gameplay Tips

-   **The "V" Dodge:** Zilong's Ult strikes a specific circle. Do not run in a straight line away from him. Dash sideways or towards him (if you are brave/tanky) to mess up his aim.
-   **Invade Blue:** Steal his blue buff. A Zilong without Mana is useless.
-   **Peel Back:** When he dives, focusing him down is easy because he has no defensive cooldowns left.

## Essential Counter Equipment (HoK Only)

1.  **Frozen Breath:**
    -   *Why:* Mages building this can slow Zilong down, preventing him from chasing after his initial jump.

2.  **Sage's Sanctuary:**
    -   *Why:* Survive the burst. Revive. Kill him while his skills are on CD.

3.  **Glacial Buckler:**
    -   *Why:* High armor and CDR for mages/sups.

## Conclusion

Zilong is a "stat check" hero. If you are squishy and let him land his Ult, you lose. If you dodge the Ult or pick **Diaochan**, he becomes useless. Watch for the lightning jump and react fast!
    `
    },
    {
        heroName: 'Ying',
        title: 'How to Counter Ying: Stop the Spear Dancer (2025)',
        summary: 'Ying confusing you with her combos? Break down her mechanics and learn how to counter Ying in Honor of Kings. Best heroes to interrupt her flow and items to shut her down.',
        keywords: 'Counter Ying HoK, Ying Strategy Guide, Anti-Ying Builds, Honor of Kings Guide',
        content: `
Ying is a flashy skirmisher who excels at extended fights. Her passive allows her to chain different "levels" of enhanced basic attacks (Cloud, Break, Flare) depending on how many skills she casts. She is slippery, has damage reduction, and a knockup ultimate.

However, Ying suffers from "Main Character Syndrome" — she needs to be the center of attention and cast prolonged animations. This is her undoing.

## Why is Ying Strong?

-   **Versatility:** She has a shield, a dash, a knockup, and a ranged slash depending on her combo.
-   **Invincibility? No, but Damage Reduction:** Her Tier 2 passive (drilling spear) heals her. Her Ultimate gives damage reduction.

## Core Weaknesses

-   **Long Animations:** Her enhanced auto-attacks lock her in place or in a fixed animation. This makes her vulnerable to skill shots.
-   **Interruptible:** She is not CC immune during most of her combos (unlike Li Bai). A simple stun stops her fancy moves.
-   **Weak Burst:** She deals damage over time. She struggles to instakill full-health targets instantly compared to Wukong or Lam.

## Best Counter Picks

### 1. Roam: Donghuang & Zhang Liang
-   **Hard CC:** Ying needs to move to generate passive stacks. Suppression stops her completely.

### 2. Jungle: Wukong & Liu Bei
-   **Wukong:** Burst damage > Sustained damage. Wukong kills her before she finishes her first combo.
-   **Liu Bei:** His Ult gives CC immunity. Ying cannot knock him up, and he blasts her face-to-face.

### 3. Mid: Mozi
-   **Mozi:** Constant long-range stuns interrupt Ying's flow. His Ultimate locks her down if she tries to dive.

## Strategic Gameplay Tips

-   **Don't Line Up:** Her Ultimate pushes everyone in a line. Step sideways.
-   **Wait for the Jump:** Her Tier 3 Passive involves her jumping into the air and slashing down. She is vulnerable during the landing. Time your CC for when she lands.
-   **Anti-Heal:** She relies on healing from her Tier 2 passive. Buy **Mortal Punisher**.

## Conclusion

Ying looks scary because she moves a lot, but her damage is predictable. Draft heavy CC (Control) and burst damage. Don't try to out-sustain her in a long fight; blow her up quickly.
    `
    },
    {
        heroName: 'Sima Yi',
        title: 'How to Counter Sima Yi: Silencing the Shadow (2025)',
        summary: 'Sima Yi assassinating you from nowhere? This guide explains how to counter the Magic Assassin. Learn to predict his Ultimate, manage the Silence, and build Magic Defense.',
        keywords: 'Counter Sima Yi HoK, Sima Yi Guide, Magic Assassin Counter, Honor of Kings Strategy',
        content: `
Sima Yi is a Magic Assassin who strikes fear into Mages and Marksmen. He is unique because he deals Magic Damage with his auto-attacks and has immense gap-closing potential. His defining trait is his "Silence" (Skill 2), which prevents victims from Flashing or using defensive skills.

## Why is Sima Yi Scary?

1.  **Global Presence:** His Ultimate allows him to dive from huge distances.
2.  **Instant Silence:** Skill 2 creates a zone that silences enemies. A silenced mage is a dead mage.
3.  **Magic Crits:** He shreds through targets who only build physical armor.

## Core Weaknesses

-   **Energy Issues:** He uses Energy, not Mana. If he misses kills or stays in a fight too long without getting takedowns to restore energy, he runs out and becomes useless.
-   **Very Squishy:** He has no defensive stats.
-   **Telegraphed Ultimate:** His Ultimate shows a warning circle. You have time to react.

## Best Counter Picks

### 1. Roam: Donghuang
-   **Donghuang:** As usual, the anti-diver king. Sima Yi dives -> Donghuang bites. Sima Yi dies instantly due to his low HP.

### 2. Clash/Jungle: Kaizer & Athena
-   **Kaizer:** Kaizer's Ultimate blocks a flat amount of damage and increases resistance. Sima Yi's multi-hit scythe attacks get mitigated heavily by Kaizer's block. Kaizer 2-shots him.

### 3. Equipment Counter: Uriel's Gift & Sucubus Cloak
-   **Crucial:** You MUST build Magic Defense.

## Strategic Gameplay Tips

-   **Watch the Shadow:** When he uses Skill 1 (Shadow form), his real body stays behind, but the shadow moves fast. If the shadow reaches you, he teleports to it. Run *away* from the shadow, or CC him immediately when he appears.
-   **The Magic Defense Fix:**
    -   **Mages:** Build **Uriel's Gift**. It gives a magic shield when you fall low on HP. This eats Sima Yi's entire burst.
    -   **Marksmen:** Buy **Succubus Cloak** or **Witch's Cloak** (updated name). The magic shield is vital.
-   **Spread Out:** Don't let his Skill 2 silence your whole team.

## Essential Counter Equipment (HoK Only)

1.  **Uriel's Gift:**
    -   *Why:* The #1 item for ADCs/Mages against magic assassins. Provides a massive shield.

2.  **Succubus Cloak:**
    -   *Why:* High Magic Defense. Sima Yi cannot one-shot you through this.

3.  **Golden Creator:**
    -   *Why:* Stasis active. Use it when he lands his Ult.

## Conclusion

Sima Yi checks if you are greedy with your build. If you build full damage, you die. If you buy one Magic Defense item (**Uriel's Gift**), you survive his burst and kill him easily while he has no energy left.
    `
    }
];

const seedGuides = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected successfully.');

        // Clean up previous AI posts to avoid duplicates/mixing languages
        await News.deleteMany({ author: 'Antigravity (AI)' });
        console.log('Cleaned up old AI guides.');

        let count = 0;
        for (const guide of GUIDES) {
            // Find hero image
            const hero = await Hero.findOne({ name: guide.heroName });
            const imageUrl = hero ? hero.image : '';

            await News.create({
                title: guide.title,
                content: guide.content,
                summary: guide.summary,
                keywords: guide.keywords,
                category: 'guides',
                author: 'Antigravity (AI)',
                image: imageUrl,
                status: 'draft', // Set as Draft
                publishedAt: new Date()
            });
            console.log(`Created Guide: ${guide.title}`);
            count++;
        }

        console.log(`\nDone! Created ${count} new English HoK guides (approx 800 words each).`);
    } catch (err) {
        console.error('Error seeding guides:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
    }
};

seedGuides();
