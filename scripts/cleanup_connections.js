const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const apiDir = path.resolve('d:/MMS/backend/api');

walkDir(apiDir, (filePath) => {
    if (filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Remove client.close() variations
        content = content.replace(/await\s+client\.close\(\);?/g, '// await client.close();');
        content = content.replace(/client\.close\(\);?/g, '// client.close();');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
});
