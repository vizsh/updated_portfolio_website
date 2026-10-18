const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/models/Computer/computer_setup.glb', out: 'public/models/Computer/computer_setup.glb' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/models/Computer/baked_computer.jpg', out: 'public/models/Computer/baked_computer.jpg' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/models/World/environment.glb', out: 'public/models/World/environment.glb' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/models/World/baked_environment.jpg', out: 'public/models/World/baked_environment.jpg' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/models/Decor/decor.glb', out: 'public/models/Decor/decor.glb' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/models/Decor/baked_decor_modified.jpg', out: 'public/models/Decor/baked_decor_modified.jpg' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/textures/monitor/layers/compressed/smudges.jpg', out: 'public/textures/monitor/smudges.jpg' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/textures/monitor/layers/compressed/shadow-compressed.png', out: 'public/textures/monitor/shadow-compressed.png' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/mouse/mouse_down.mp3', out: 'public/audio/mouse/mouse_down.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/mouse/mouse_up.mp3', out: 'public/audio/mouse/mouse_up.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/startup/startup.mp3', out: 'public/audio/startup/startup.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/keyboard/key_1.mp3', out: 'public/audio/keyboard/key_1.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/keyboard/key_2.mp3', out: 'public/audio/keyboard/key_2.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/keyboard/key_3.mp3', out: 'public/audio/keyboard/key_3.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/keyboard/key_4.mp3', out: 'public/audio/keyboard/key_4.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/keyboard/key_5.mp3', out: 'public/audio/keyboard/key_5.mp3' },
  { url: 'https://raw.githubusercontent.com/henryjeff/portfolio-website/master/static/audio/keyboard/key_6.mp3', out: 'public/audio/keyboard/key_6.mp3' }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    
    function get(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          get(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${currentUrl}' (${response.statusCode})`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }
    get(url);
  });
}

async function run() {
  for (const f of files) {
    console.log(`Downloading ${f.out}...`);
    try {
      await downloadFile(f.url, f.out);
      const stat = fs.statSync(f.out);
      console.log(`✓ ${f.out} (${stat.size} bytes)`);
    } catch (e) {
      console.error(`✗ Error downloading ${f.out}:`, e.message);
    }
  }
  console.log('Finished downloading all assets.');
}

run();
