const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const distJsDir = path.join(distDir, 'js');

fs.mkdirSync(distJsDir, { recursive: true });
fs.copyFileSync(path.join(__dirname, '..', 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, '..', 'js', 'app.min.js'), path.join(distJsDir, 'app.min.js'));

let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
html = html.replace('js/app.js', 'js/app.min.js');
fs.writeFileSync(path.join(distDir, 'index.html'), html);

console.log('Production build complete: dist/');
