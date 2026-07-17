import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// --- CONFIGURATION ---
const NEW_PKG_NAME = 'kompg45';
const NEW_REPO_PATH = 'jyvplay/kompg45';
const NEW_REPO_URL = `https://github.com/${NEW_REPO_PATH}`;
// ---------------------

console.log(`🚀 Starting Repository Initialization Script for ${NEW_PKG_NAME}...`);

console.log("1. Updating package.json...");
const localPkgPath = path.resolve('package.json');
const localPkg = JSON.parse(fs.readFileSync(localPkgPath, 'utf-8'));

localPkg.name = NEW_PKG_NAME;
localPkg.version = "1.0.0";
delete localPkg.private;
localPkg.publishConfig = { access: "public" };

if (!localPkg.repository) localPkg.repository = {};
localPkg.repository.type = "git";
localPkg.repository.url = `git+${NEW_REPO_URL}.git`;
localPkg.bugs = { url: `${NEW_REPO_URL}/issues` };
localPkg.homepage = `${NEW_REPO_URL}#readme`;

fs.writeFileSync(localPkgPath, JSON.stringify(localPkg, null, 2));

console.log("2. Rewriting internal imports and references...");
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.html', '.json', '.mjs'];

function patchFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                patchFiles(fullPath);
            }
        } else if (EXTENSIONS.includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = false;
            
            // Replace old template names if they exist
            if (content.includes('kompg45')) {
                content = content.replaceAll('kompg45', NEW_PKG_NAME);
                modified = true;
            }
            
            if (modified) fs.writeFileSync(fullPath, content, 'utf-8');
        }
    }
}
patchFiles(process.cwd());

console.log("3. Cleaning up and syncing lockfile...");
if (fs.existsSync('package-lock.json')) fs.rmSync('package-lock.json');
execSync('npm install', { stdio: 'inherit' });

console.log(`✅ Initialization complete! Ready to push to ${NEW_REPO_PATH} and publish to NPM as ${NEW_PKG_NAME}.`);