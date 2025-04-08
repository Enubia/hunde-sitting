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
    return `npx tscw --noEmit ${relativePaths} --includeDeclarationDir ./@types`;
}

export default {
    'src/**/*.ts': ['eslint -c ../../eslint.config.mjs', typeCheck],
};
