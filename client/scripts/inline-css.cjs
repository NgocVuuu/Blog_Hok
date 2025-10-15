// scripts/inline-css.cjs
const fs = require('fs');
const path = require('path');
const Critters = require('critters');

(async () => {
  // __dirname = .../scripts
  const rootDir   = path.resolve(__dirname, '..'); // repo root
  const buildDir  = path.join(rootDir, 'build');
  const indexPath = path.join(buildDir, 'index.html');

  // Debug hữu ích trên Cloudflare Pages
  try {
    console.log('Working dir:', process.cwd());
    console.log('Build dir:', buildDir);
    if (fs.existsSync(buildDir)) {
      console.log('Build dir contents:', fs.readdirSync(buildDir));
    } else {
      console.warn('⚠️  Build dir not found:', buildDir);
    }
  } catch {}

  if (!fs.existsSync(indexPath)) {
    console.warn('⚠️  index.html not found at:', indexPath, '→ skip inlining (not failing build).');
    process.exit(0); // KHÔNG fail build để Pages vẫn deploy
  }

  try {
    const html = fs.readFileSync(indexPath, 'utf8');
    const critters = new Critters({
      path: buildDir,     // thư mục chứa CSS/JS
      publicPath: '/',    // đúng cho CRA trên Pages
      pruneSource: false, // an toàn: không xóa CSS gốc
      logLevel: 'info',
      preload: 'swap'
    });

    const processed = await critters.process(html);
    fs.writeFileSync(indexPath, processed, 'utf8');
    console.log('✅ Critters inlining completed:', indexPath);
  } catch (err) {
    console.error('❌ Critters processing failed:', err);
    process.exit(1);
  }
})();
