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
let found = 0;

walkDir(apiDir, (filePath) => {
    if (filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('new ObjectId(') && !content.includes('ObjectId } = require("mongodb")') && !content.includes('ObjectId = require("mongodb").ObjectId')) {
            console.log(`Potential missing import: ${filePath}`);
            found++;
        }
    }
});

if (found === 0) console.log("No missing imports found.");
