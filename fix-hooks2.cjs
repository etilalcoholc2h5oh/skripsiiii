const fs = require('fs');
let code = fs.readFileSync('src/components/StudentWorkspace.tsx', 'utf-8');

// Find the index of the first `if (!progress) {`
const progressIndex = code.indexOf('if (!progress) {');
if (progressIndex === -1) { console.log('Cannot find progress'); process.exit(1); }

// Find the index of `useEffect(() => {\n    if (!localDraft) return;`
const useEffIndex = code.indexOf('useEffect(() => {\n    if (!localDraft) return;');
if (useEffIndex === -1) { console.log('Cannot find useEffect'); process.exit(1); }

// Extract the useEffect block. It ends at `  }, [localDraft]);`
const useEffEndStr = '  }, [localDraft]);';
const useEffEndIndex = code.indexOf(useEffEndStr, useEffIndex) + useEffEndStr.length;

const useEffBlock = code.substring(useEffIndex, useEffEndIndex);

// Remove the useEffect block and its trailing newlines
code = code.replace(useEffBlock + '\n', '');
code = code.replace(useEffBlock, '');

// Insert the useEffect block BEFORE the `if (!progress) {`
code = code.substring(0, progressIndex) + useEffBlock + '\n\n  ' + code.substring(progressIndex);

fs.writeFileSync('src/components/StudentWorkspace.tsx', code);
console.log("Hooks fixed.");
