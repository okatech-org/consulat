import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../ai-sum/.code_base.md');
const outputPath = join(__dirname, '../ai-sum/.code_base.md');

async function minifyMarkdown() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');

        // Markdown is text, so basic minification is just removing extra whitespace.
        // More advanced minification could involve parsing and reformatting, but is likely overkill.
        const minifiedData = data.replace(/\s+/g, ' ').trim();


        fs.writeFileSync(outputPath, minifiedData);
        console.log('Markdown minified successfully!');
    } catch (err) {
        console.error('Error minifying Markdown:', err);
    }
}

minifyMarkdown();
