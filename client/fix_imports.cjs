const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.git') {
                walkDir(dirPath, callback);
            }
        } else {
            if (f.endsWith('.js') || f.endsWith('.jsx')) {
                callback(path.join(dir, f));
            }
        }
    });
};

const mappings = [
    { from: '@/components/landing', to: '@/Components/Landing' },
    { from: '@/components/marketplace', to: '@/Components/Marketplace' },
    { from: '@/components/ui', to: '@/Components/ui' },
    { from: '@/components', to: '@/Components' }, // Catch-all for others
];

walkDir(path.resolve(__dirname, 'src'), (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    mappings.forEach(m => {
        // Global replace with case-insensitivity on the 'from' part might be tricky if regex?
        // But here we know it's predominantly lowercase '@/components' causing issues.
        // We'll just replace the exact string instances.
        const regex = new RegExp(m.from, 'g');
        content = content.replace(regex, m.to);
    });

    if (content !== originalContent) {
        console.log(`Fixing imports in: ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});
