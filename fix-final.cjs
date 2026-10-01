const fs = require('fs');
let code = fs.readFileSync('src/components/StudentWorkspace.tsx', 'utf-8');

// The early return block
const earlyReturn = `  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-medium animate-pulse">Menghubungkan ke Ruang Kelas...</p>
      </div>
    );
  }`;

// The useEffect block we want to ensure only appears once at the top
const useEffStr = `  useEffect(() => {
    if (!localDraft) return;
    if (visualTimeoutRef.current) {
      clearTimeout(visualTimeoutRef.current);
    }
    visualTimeoutRef.current = setTimeout(() => {
      handleUpdateVisual();
    }, 4000);
    return () => {
      if (visualTimeoutRef.current) clearTimeout(visualTimeoutRef.current);
    };
  }, [localDraft]);`;

// A more robust regex removal for the useEffect block because of spacing variations:
code = code.replace(/  useEffect\(\(\) => \{\s+if \(!localDraft\) return;[\s\S]*?\}, \[localDraft\]\);/g, '');
code = code.replace(/  if \(!progress\) \{[\s\S]*?Menghubungkan ke Ruang Kelas\.\.\.<\/p>\s+<\/div>\s+\);\s+\}/g, '');

const target = `  }, [sessionId, studentId]);\n`;
const insertionIndex = code.indexOf(target) + target.length;

if (insertionIndex - target.length === -1) {
  console.log("Could not find insertion point.");
  process.exit(1);
}

// Insert them correctly. Hooks first, then the early return.
code = code.substring(0, insertionIndex) + '\n' + useEffStr + '\n\n' + earlyReturn + '\n' + code.substring(insertionIndex);

fs.writeFileSync('src/components/StudentWorkspace.tsx', code);
console.log("Hooks fixed cleanly.");
