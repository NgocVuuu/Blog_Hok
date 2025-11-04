const fs = require('fs');
const path = require('path');

function rimraf(folder) {
  try {
    const p = path.resolve(folder);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`Removed ${p}`);
    } else {
      console.log(`${p} does not exist`);
    }
  } catch (e) {
    console.error('Failed to remove', folder, e);
    process.exitCode = 1;
  }
}

// Remove Next build cache which can contain very large .pack files that break Cloudflare Pages asset limits
rimraf('.next/cache');

// Also remove any large webpack cache artifacts that might still be present
rimraf('.next/cache/webpack');

console.log('cleanCache finished');
