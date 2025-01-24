const fs = require('fs');
const path = require('path');

const frJsonPath = path.join(__dirname, '../translations', 'fr.json');
const frSampleJsonPath = path.join(__dirname, '../translations', 'sample.json');

// Function to recursively replace all string values with empty strings
const replaceStrings = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = '';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      replaceStrings(obj[key]);
    }
  }
};

// Read and parse fr.json
const frJson = JSON.parse(fs.readFileSync(frJsonPath, 'utf8'));

// Replace all string values with empty strings
replaceStrings(frJson);

// Write the updated content to sample.json
fs.writeFileSync(frSampleJsonPath, JSON.stringify(frJson, null, 2), 'utf8');

console.log('sample.json has been created with empty string values.');
