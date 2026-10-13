const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'dist');
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const js=['workspace-data.js','icons.js','model.js','ui-helpers.js','views.js','app.js'].map(name=>read(name)
 .replace(/^import .+;\s*$/gm,'')
 .replace(/^export\s*\{[^}]*\};?\s*$/gm,'')
 .replace(/^export\s+/gm,'')).join('\n');
const html=read('index.html')
 .replace('<link rel="stylesheet" href="./styles.css">',()=>`<style>${read('styles.css')}</style>`)
 .replace('<link rel="stylesheet" href="./expanded.css">',()=>`<style>${read('expanded.css')}</style>`)
 .replace('<script type="module" src="./app.js"></script>',()=>`<script type="module">${js}</script>`);
fs.writeFileSync(path.join(__dirname,'OneHand-CRM-UX-preview.html'),html);
console.log('Standalone HTML created.');
