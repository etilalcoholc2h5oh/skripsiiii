import fs from 'fs';

let code = fs.readFileSync('src/components/StudentWorkspace.tsx', 'utf-8');

// 1. Remove all `if (!progress)` blocks.
const earlyReturn = `  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-medium animate-pulse">Menghubungkan ke Ruang Kelas...</p>
      </div>
    );
  }`;
code = code.split(earlyReturn).join('');

// 2. Remove all instances of the useEffect
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
code = code.split(useEffStr).join('');

// 3. Insert both exactly after the first useEffect.
const target = `  }, [sessionId, studentId]);`;
const insertionIndex = code.indexOf(target) + target.length;

if (insertionIndex - target.length === -1) {
  console.log("Could not find insertion point.");
  process.exit(1);
}

// Clean up extra blank lines maybe? Just insert cleanly.
code = code.substring(0, insertionIndex) + '\n\n' + useEffStr + '\n\n' + earlyReturn + code.substring(insertionIndex);

fs.writeFileSync('src/components/StudentWorkspace.tsx', code);
console.log("DONE!");
