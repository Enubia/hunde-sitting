import path from 'node:path';

/**
 * Passing absolute path is fine, but relative path is cleaner in console.
 * @param {string[]} files
 */
function typeCheck(files) {
    const cwd = process.cwd();
    const relativePaths = files
        .map(file => path.relative(cwd, file))
        .join(' ');
    // if you need to include declaration files, use --includeDeclarationDir path-to-declaration-dir
    return `npx tscw --noEmit ${relativePaths}`;
}

export default {
    'src/**/*.{js,ts}': 'eslint -c ./eslint.config.js',
    'src/**/*.ts': [typeCheck],
};
