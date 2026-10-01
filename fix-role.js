const fs = require('fs');

let code = fs.readFileSync('src/components/RoleSelection.tsx', 'utf-8');

// For KBM sessions
code = code.replace(
  /const handleResumeStudentSession = \(item: SavedSessionItem\) => \{\n    if \(\!item\.studentId\) return;\n    onJoinSession\(item\.sessionId, item\.studentId\);\n  \};/,
  `const handleResumeStudentSession = (item: SavedSessionItem) => {\n    if (!item.studentId) {\n      alert("Maaf, draf ini adalah format lama dan tidak dapat dilanjutkan. Silakan hapus dan mulai sesi baru.");\n      return;\n    }\n    onJoinSession(item.sessionId, item.studentId);\n  };`
);

// For Solo sessions Lanjut button
code = code.replace(
  /onClick=\{\(\) => onJoinSession\(item\.sessionId, item\.studentId\!\)\}/g,
  `onClick={() => {\n                            if (!item.studentId) {\n                              alert("Maaf, draf mandiri ini menggunakan format lama. Silakan hapus dan buat Latihan Mandiri baru.");\n                              return;\n                            }\n                            onJoinSession(item.sessionId, item.studentId);\n                          }}`
);

fs.writeFileSync('src/components/RoleSelection.tsx', code);
console.log("Fixed!");
