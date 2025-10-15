const fs = require('fs');
const path = require('path');
const Critters = require('critters');

const buildDir = path.resolve(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

async function runCritters() {
  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found in build directory.');
    process.exit(1);
  }

  const critters = new Critters({
    path: buildDir,
    publicPath: '/',
    pruneSource: false,
    logLevel: 'info',
  });

  try {
    const html = fs.readFileSync(indexPath, 'utf8');
    const processed = await critters.process(html);
    fs.writeFileSync(indexPath, processed, 'utf8');
    console.log('Critters inlining completed successfully.');
  } catch (err) {
    console.error('Critters processing failed:', err);
    process.exit(1);
  }
}

runCritters();
