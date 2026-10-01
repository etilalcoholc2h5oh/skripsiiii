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

// Remove all occurrences
code = code.split(earlyReturn).join('');

// Make sure we have a clean line for the main return
const mainReturn = `  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-16">`;

if (code.includes(mainReturn)) {
  code = code.replace(mainReturn, earlyReturn + '\n\n' + mainReturn);
  fs.writeFileSync('src/components/StudentWorkspace.tsx', code);
  console.log("SUCCESS: Early return moved to just before main return.");
} else {
  console.log("ERROR: Could not find main return block.");
}
