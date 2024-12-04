const fs = require('fs');
const path = require('path');

const envExample = `API_URL=https://rapimo.api-base.de
API_URL_COLOGNE=https://rapimo.api-base-cologne.de
API_URL_BERLIN=https://rapimo.api-base-berlin.de`;

const envLocal = `API_URL=https://0.0.0.0:443
API_URL_COLOGNE=https://0.0.0.0:443
API_URL_BERLIN=https://0.0.0.0:443`;

const env = `API_URL=https://api.production.com
API_URL_COLOGNE=https://api.production-cologne.com
API_URL_BERLIN=https://api.production-berlin.com`;

const files = [
  { name: '.env.example', content: envExample },
  { name: '.env.local', content: envLocal },
  { name: '.env', content: env }
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, file.content);
    console.log(`Created ${file.name}`);
  } else {
    console.log(`${file.name} already exists`);
  }
});