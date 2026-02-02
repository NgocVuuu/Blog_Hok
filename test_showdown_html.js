const showdown = require('showdown');

const converter = new showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

const htmlTable = `
<table>
  <thead>
    <tr>
      <th>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="img.jpg"></td>
    </tr>
  </tbody>
</table>
`;

const markdownWithHtml = `
# Title

Some text

${htmlTable}

End text
`;

console.log("--- Original Markdown with embedded HTML ---");
console.log(markdownWithHtml);

const outputHtml = converter.makeHtml(markdownWithHtml);
console.log("\n--- Output HTML from Showdown ---");
console.log(outputHtml);
