import fs from 'fs';
import path from 'path';

const csvPath = path.join(process.cwd(), 'barcodes.csv');

// Lexo të gjithë CSV-në
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');

const fixed = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (i === 0) {
    // Header
    fixed.push(line);
  } else if (line === '') {
    continue;
  } else {
    // Ndaj barkodin dhe emrin
    const commaIndex = line.indexOf(',');
    if (commaIndex === -1) {
      fixed.push(line);
      continue;
    }
    
    let barcode = line.substring(0, commaIndex).trim();
    const name = line.substring(commaIndex + 1).trim();
    
    // Kontrolloje nëse barkodin është në scientific notation
    if (barcode.includes('E') || barcode.includes('e')) {
      // Konverto nga scientific notation në numër të plotë
      try {
        const num = parseFloat(barcode);
        if (!isNaN(num)) {
          barcode = Math.round(num).toString();
        }
      } catch (e) {
        // Mbaj originalin nëse nuk mund ta konvertoj
      }
    }
    
    // Heq .00 nëse përfundon me ato
    if (barcode.endsWith('.00')) {
      barcode = barcode.substring(0, barcode.length - 3);
    }
    
    fixed.push(`${barcode},${name}`);
  }
}

// Shkruaj prapë
fs.writeFileSync(csvPath, fixed.join('\n'), 'utf-8');
console.log('✅ CSV rregulluar - konvertuar scientific notation në numra të plotë');
