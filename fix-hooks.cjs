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

// I will just remove it, and insert it back BEFORE the rendering part:
// return (
//    <div className="flex flex-col h-[calc(100vh-6rem)]">

code = code.replace(earlyReturn, '');
code = code.replace('  return (\n    <div className="flex flex-col h-[calc(100vh-6rem)]">', earlyReturn + '\n\n  return (\n    <div className="flex flex-col h-[calc(100vh-6rem)]">');

fs.writeFileSync('src/components/StudentWorkspace.tsx', code);
console.log("Hooks fixed.");
