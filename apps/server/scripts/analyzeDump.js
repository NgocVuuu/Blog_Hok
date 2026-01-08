const fs = require('fs');
const html = fs.readFileSync('dump_angela_scroll.html', 'utf8');

// Find all occurrences of "skill" (case insensitive) and print context
const regex = /.{0,50}skill.{0,50}/gi;
const matches = html.match(regex);
console.log('--- Matches for "skill" ---');
if (matches) {
    matches.forEach(m => console.log(m));
} else {
    console.log('No matches for "skill"');
}

// Find all img tags
const imgRegex = /<img[^>]+>/g;
const imgs = html.match(imgRegex);
console.log('\n--- Images ---');
if (imgs) {
    imgs.forEach(img => {
        if (img.includes('skill') || img.includes('icon')) console.log(img);
    });
} else {
    console.log('No images found');
}

// Check for tabs
const tabs = html.match(/.{0,50}tab.{0,50}/gi);
console.log('\n--- Tabs ---');
if (tabs) {
    tabs.slice(0, 10).forEach(t => console.log(t));
}
