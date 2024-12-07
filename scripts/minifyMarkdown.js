const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../ai-sum/.code_base.md');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Remove unnecessary spaces
  const minifiedContent = data.replace(/\s+/g, ' ').trim();

  fs.writeFile(filePath, minifiedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing the file:', err);
      return;
    }

    console.log('File minified successfully.');
  });
});