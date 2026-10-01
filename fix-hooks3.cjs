const fs = require('fs');
let code = fs.readFileSync('src/components/StudentWorkspace.tsx', 'utf-8');

const earlyReturn = `  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-medium animate-pulse">Menghubungkan ke Ruang Kelas...</p>
      </div>
    );
  }`;

// Remove all instances of earlyReturn
code = code.split(earlyReturn).join('');

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

// Remove all instances of useEffStr
code = code.split(useEffStr).join('');

// Now insert them both back right after the first useEffect!
const hookToInsertAfter = `  }, [sessionId, studentId]);\n`;
const insertionIndex = code.indexOf(hookToInsertAfter) + hookToInsertAfter.length;

if (insertionIndex - hookToInsertAfter.length === -1) {
  console.log("Could not find insertion point.");
  process.exit(1);
}

const cleanCode = code.substring(0, insertionIndex) + '\n' + useEffStr + '\n\n' + earlyReturn + '\n' + code.substring(insertionIndex);

// Wait, I might have multiple blank lines now. It's fine.
fs.writeFileSync('src/components/StudentWorkspace.tsx', cleanCode);
console.log("Restored and fixed hooks.");
