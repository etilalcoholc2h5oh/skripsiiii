const fs = require('fs');
let code = fs.readFileSync('src/components/StudentWorkspace.tsx', 'utf-8');

// Find where imports end
const lines = code.split('\n');
let lastImportLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('import ')) {
    lastImportLine = i;
  }
}

// But wait, lucide-react import is multiline!
// Let's just find "from 'lucide-react';"
