const showdown = require('showdown');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');

const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});
turndownService.use(gfm);
turndownService.keep(['table']);

const markdown = `
| Column 1 | Column 2 |
| :--- | :--- |
| ![Image 1](http://example.com/1.jpg) | Text |
| ![Image 2](http://example.com/2.jpg) | Text 2 |
`;

console.log("--- Original Markdown ---");
console.log(markdown);

const html = converter.makeHtml(markdown);
console.log("\n--- Generated HTML (Showdown) ---");
console.log(html);

const newMarkdown = turndownService.turndown(html);
console.log("\n--- Converted Back to Markdown (Turndown) ---");
console.log(newMarkdown);
