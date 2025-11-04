const fs = require('fs');
const path = require('path');

async function copyDir(src, dest){
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for(const e of entries){
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if(e.isDirectory()){
      await copyDir(srcPath, destPath);
    } else if(e.isFile()){
      // Attempt copy with retries (some files may be locked by OneDrive)
      const maxRetries = 3;
      let attempt = 0;
      let copied = false;
      while(attempt < maxRetries && !copied){
        try{
          await fs.promises.copyFile(srcPath, destPath);
          copied = true;
        }catch(err){
          attempt++;
          if(attempt >= maxRetries){
            console.warn('Skipping file after retries (copy failed):', srcPath, err && err.message);
          } else {
            // small delay before retry
            await new Promise(r => setTimeout(r, 200 * attempt));
          }
        }
      }
    }
  }
}

async function main(){
  const repoRoot = path.resolve(__dirname, '..');
  const srcPublic = path.resolve(repoRoot, '..', 'client', 'public');
  const destPublic = path.resolve(repoRoot, 'public');

  if(!fs.existsSync(srcPublic)){
    console.error('Source public folder not found:', srcPublic);
    process.exit(1);
  }

  console.log('Copying public assets from', srcPublic, 'to', destPublic);
  try{
    await copyDir(srcPublic, destPublic);
    console.log('Assets copied successfully.');
  }catch(err){
    console.error('Asset copy failed:', err);
    process.exit(1);
  }
}

main();
