const fs = require('fs');

let code = fs.readFileSync('src/components/StudentWorkspace.tsx', 'utf-8');

const regex = /(const CHIBI_VARS = \[[\s\S]*?};\n\n)(import \{[\s\S]*?from 'lucide-react';\nimport \{ motion, AnimatePresence \} from 'motion\/react';\nimport \{ HandwritingCanvas \} from '\.\/HandwritingCanvas';\nimport \{ PrintPdfModal \} from '\.\/PrintPdfModal';\n)/;

// Let's just do indexOf and split.
const importLucideIdx = code.indexOf("import { \n  Lightbulb");
if (importLucideIdx === -1) {
  console.log("Could not find import");
}

let topPart = code.substring(0, code.indexOf("const CHIBI_VARS"));
let constPart = code.substring(code.indexOf("const CHIBI_VARS"), importLucideIdx);
let importPart = code.substring(importLucideIdx, code.indexOf("interface StudentWorkspaceProps {"));
let bottomPart = code.substring(code.indexOf("interface StudentWorkspaceProps {"));

let newCode = topPart + importPart + constPart + bottomPart;
fs.writeFileSync('src/components/StudentWorkspace.tsx', newCode);
console.log("Fixed!");
