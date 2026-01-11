const gameData = require('./config/gameData');

// 1. Verify Config
const greenId = 3;
const blueId = 2;
const greenColor = gameData.arcanaColors[greenId];
const blueColor = gameData.arcanaColors[blueId];

console.log(`[Config Check] ID 3 maps to: ${greenColor} (Expected: green)`);
console.log(`[Config Check] ID 2 maps to: ${blueColor} (Expected: blue)`);

if (greenColor === 'green' && blueColor === 'blue') {
    console.log('✅ Config Mapping is CORRECT.');
} else {
    console.error('❌ Config Mapping is WRONG.');
}

// 2. Verify Regex Logic
const testNames = [
    "Lvl 5: Calamity",
    "Lv 5: Mind's Eye",
    "Lvl 5: Harmony",
    "Normal Name",
    "Lvl 1: Fate"
];

const regex = /^(Lvl|Lv)\s*\d+\s*:\s*/i;

console.log('\n[Regex Check]');
testNames.forEach(name => {
    const clean = name.replace(regex, '').trim();
    console.log(`"${name}" -> "${clean}"`);
});

if (testNames[0].replace(regex, '').trim() === "Calamity") {
    console.log('✅ Regex Logic is CORRECT.');
} else {
    console.error('❌ Regex Logic is WRONG.');
}
