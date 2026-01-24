// Fix the CSV: swap columns from (name, barcode) to (barcode, name)
const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'barcodes.csv');
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n');

const fixed = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Skip old header, add new header on first iteration
  if (i === 0) {
    fixed.push('barcode,name');
    continue;
  }

  // Parse CSV line (handle quoted fields)
  let barcode, name;
  
  // Check if line contains quotes
  if (line.includes('"')) {
    // Handle quoted fields
    const match = line.match(/"([^"]*)",(.+)$|^([^,]*),(.+)$/);
    if (match) {
      if (match[1] !== undefined) {
        // First field was quoted
        name = match[1];
        barcode = match[2].trim();
      } else {
        // First field wasn't quoted
        name = match[3];
        barcode = match[4].trim();
      }
    } else {
      // Fallback: simple split
      const parts = line.split(',');
      name = parts[0].replace(/"/g, '').trim();
      barcode = parts[1] ? parts[1].trim() : '';
    }
  } else {
    // Simple case: no quotes
    const parts = line.split(',');
    name = parts[0] ? parts[0].trim() : '';
    barcode = parts[1] ? parts[1].trim() : '';
  }

  // Only add if both fields exist
  if (barcode && name) {
    // Escape quotes in name
    const escapedName = name.replace(/"/g, '""');
    // Check if name needs quoting
    if (escapedName.includes(',') || escapedName.includes('"') || escapedName.includes('\n')) {
      fixed.push(`${barcode},"${escapedName}"`);
    } else {
      fixed.push(`${barcode},${escapedName}`);
    }
  }
}

// Write fixed CSV
fs.writeFileSync(csvPath, fixed.join('\n') + '\n', 'utf-8');
console.log(`✓ Fixed barcodes.csv: ${fixed.length - 1} products swapped (barcode first, name second)`);
