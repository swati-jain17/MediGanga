import fs from 'fs';
import path from 'path';

const filenamesFile = path.join(process.cwd(), 'filenames.txt');
const medicinesDir = path.join(process.cwd(), 'frontend/public/medicines');
const placeholderPath = path.join(process.cwd(), 'frontend/public/medicine_placeholder.png');

if (!fs.existsSync(filenamesFile)) {
    console.error('filenames.txt not found');
    process.exit(1);
}

if (!fs.existsSync(placeholderPath)) {
    console.error('Placeholder image not found');
    process.exit(1);
}

// Ensure dir exists
if (!fs.existsSync(medicinesDir)) {
    fs.mkdirSync(medicinesDir, { recursive: true });
}

const content = fs.readFileSync(filenamesFile, 'utf-8');
const files = content.split('\n').filter(line => line.trim() && !line.startsWith('total'));

console.log(`Restoring ${files.length} images...`);

files.forEach(line => {
    // ls -l output:
    // -rw-r--r--@ 1 user staff size date filename
    // We strictly want the filename which is the LAST part.
    const parts = line.split(/\s+/);
    const filename = parts[parts.length - 1];

    // Ignore lines that don't look like files or are directories
    if (!filename || filename.startsWith('total')) return;

    // Handle full path vs relative
    const basename = path.basename(filename);

    const targetPath = path.join(medicinesDir, basename);

    try {
        fs.copyFileSync(placeholderPath, targetPath);
        // console.log(`Restored ${basename}`);
    } catch (e) {
        console.error(`Failed to copy to ${basename}`, e);
    }
});

console.log('Restoration complete.');
