const fs = require('fs');
const path = require('path');

const directoriesToScan = [
  path.join(__dirname, 'src/pages'),
  path.join(__dirname, 'src/components'),
];

const replacements = [
  // Backgrounds
  { regex: /background:\s*'#06070a'/g, replace: "background: 'var(--bg-main)'" },
  { regex: /background:\s*'#101124'/g, replace: "background: 'var(--modal-bg)'" },
  { regex: /backgroundColor:\s*'#101124'/g, replace: "backgroundColor: 'var(--modal-bg)'" },
  { regex: /background:\s*'rgba\(255,\s*255,\s*255,\s*0\.02\)'/g, replace: "background: 'var(--card-bg)'" },
  { regex: /backgroundColor:\s*'rgba\(255,\s*255,\s*255,\s*0\.02\)'/g, replace: "backgroundColor: 'var(--card-bg)'" },
  { regex: /background:\s*'rgba\(255,255,255,0\.02\)'/g, replace: "background: 'var(--card-bg)'" },
  { regex: /background:\s*'rgba\(255,\s*255,\s*255,\s*0\.03\)'/g, replace: "background: 'var(--card-bg)'" },
  { regex: /background:\s*'rgba\(255,255,255,0\.03\)'/g, replace: "background: 'var(--card-bg)'" },
  { regex: /background:\s*'rgba\(255,\s*255,\s*255,\s*0\.05\)'/g, replace: "background: 'var(--input-bg)'" },
  { regex: /backgroundColor:\s*'rgba\(255,\s*255,\s*255,\s*0\.05\)'/g, replace: "backgroundColor: 'var(--input-bg)'" },
  { regex: /background:\s*'rgba\(255,255,255,0\.05\)'/g, replace: "background: 'var(--input-bg)'" },
  { regex: /background:\s*'rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, replace: "background: 'var(--btn-secondary-bg)'" },
  { regex: /background:\s*'rgba\(255,255,255,0\.08\)'/g, replace: "background: 'var(--btn-secondary-bg)'" },
  
  // Borders
  { regex: /border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.04\)'/g, replace: "border: '1px solid var(--border-subtle)'" },
  { regex: /border:\s*'1px solid rgba\(255,255,255,0\.04\)'/g, replace: "border: '1px solid var(--border-subtle)'" },
  { regex: /border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)'/g, replace: "border: '1px solid var(--border-light)'" },
  { regex: /border:\s*'1px solid rgba\(255,255,255,0\.05\)'/g, replace: "border: '1px solid var(--border-light)'" },
  { regex: /border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.06\)'/g, replace: "border: '1px dashed var(--border-light)'" },
  { regex: /border:\s*'1px dashed rgba\(255,255,255,0\.06\)'/g, replace: "border: '1px dashed var(--border-light)'" },
  { regex: /border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, replace: "border: '1px solid var(--border-strong)'" },
  { regex: /border:\s*'1px solid rgba\(255,255,255,0\.08\)'/g, replace: "border: '1px solid var(--border-strong)'" },
  { regex: /border:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.1\)'/g, replace: "border: '1px solid var(--input-border)'" },
  { regex: /border:\s*'1px solid rgba\(255,255,255,0\.1\)'/g, replace: "border: '1px solid var(--input-border)'" },
  { regex: /borderBottom:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)'/g, replace: "borderBottom: '1px solid var(--border-light)'" },
  { regex: /borderBottom:\s*'1px solid rgba\(255,255,255,0\.05\)'/g, replace: "borderBottom: '1px solid var(--border-light)'" },
  { regex: /borderBottom:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, replace: "borderBottom: '1px solid var(--border-strong)'" },
  { regex: /borderBottom:\s*'1px solid rgba\(255,255,255,0\.08\)'/g, replace: "borderBottom: '1px solid var(--border-strong)'" },
  { regex: /borderTop:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.05\)'/g, replace: "borderTop: '1px solid var(--border-light)'" },
  { regex: /borderTop:\s*'1px solid rgba\(255,255,255,0\.05\)'/g, replace: "borderTop: '1px solid var(--border-light)'" },
  { regex: /borderTop:\s*'1px solid rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, replace: "borderTop: '1px solid var(--border-strong)'" },
  { regex: /borderTop:\s*'1px solid rgba\(255,255,255,0\.08\)'/g, replace: "borderTop: '1px solid var(--border-strong)'" },
  
  // Text Colors
  { regex: /color:\s*'#fff'/g, replace: "color: 'var(--text-title)'" },
  { regex: /color:\s*'#ffffff'/g, replace: "color: 'var(--text-title)'" },
  { regex: /color:\s*'#f3f4f6'/g, replace: "color: 'var(--text-main)'" },
  { regex: /color:\s*'#e5e7eb'/g, replace: "color: 'var(--text-main)'" },
  
  // Specifically for gradients
  { regex: /#0e0f1e/g, replace: "var(--sidebar-bg-start)" },
  { regex: /#07070f/g, replace: "var(--sidebar-bg-end)" },
  { regex: /#06070a/g, replace: "var(--bg-main)" }
];

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;

      replacements.forEach(rep => {
        newContent = newContent.replace(rep.regex, rep.replace);
      });

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated styles in: ${fullPath}`);
      }
    }
  });
}

directoriesToScan.forEach(dir => processDirectory(dir));
console.log('Style refactoring complete.');
