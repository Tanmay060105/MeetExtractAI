const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find raw error div
  const regex = /<div className="rounded-md bg-red-50 p-4 border border-red-200(?: max-w-3xl)?">\s*<div className="flex">\s*(?:<div className="flex-shrink-0">\s*)?<AlertCircle[^>]*>\s*(?:<\/div>\s*)?<div className="(?:ml-3 )?text-sm text-red-700">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  
  let changed = false;
  if (regex.test(content)) {
    content = content.replace(regex, (match, innerText) => {
        return `<Alert variant="destructive">\n        ${innerText.trim()}\n      </Alert>`;
    });
    changed = true;
  }
  
  // There is another pattern in reviews page: 
  // <AlertCircle className="h-5 w-5 text-red-400 mr-3" /> inside a flex div
  const regex2 = /<div className="rounded-md bg-red-50 p-4 border border-red-200">\s*<div className="flex">\s*<AlertCircle[^>]*\/>\s*<div className="text-sm text-red-700">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, (match, innerText) => {
        return `<Alert variant="destructive">\n        ${innerText.trim()}\n      </Alert>`;
    });
    changed = true;
  }

  if (changed) {
    // Add import { Alert } from "@/components/ui/alert"; if not present
    if (!content.includes('import { Alert } from "@/components/ui/alert"')) {
        // Find the last import
        const imports = content.match(/import .* from .*/g);
        if (imports) {
            const lastImport = imports[imports.length - 1];
            content = content.replace(lastImport, `${lastImport}\nimport { Alert } from "@/components/ui/alert";`);
        }
    }
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
