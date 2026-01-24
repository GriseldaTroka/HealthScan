// scripts/uploadBarcodes.js
// Script to upload barcodes from CSV to Firebase

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_ZeP8fHxd1HP4IYHDPoon-T0rS9tjZqw",
  authDomain: "healthscanapp-a851a.firebaseapp.com",
  projectId: "healthscanapp-a851a",
  storageBucket: "healthscanapp-a851a.firebasestorage.app",
  messagingSenderId: "290150179152",
  appId: "1:290150179152:web:0046f7c957386009eccc55",
  measurementId: "G-KB1MTEJMBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadBarcodes() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'barcodes.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const lines = csvContent.split('\n');
    
    console.log('Starting barcode upload...');
    console.log(`Found ${lines.length - 1} barcodes to upload`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Skip header row and process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [barcode, name] = line.split(',');
      
      if (!barcode || !name) {
        console.log(`Skipping invalid line ${i}: ${line}`);
        errorCount++;
        continue;
      }
      
      try {
        const docRef = doc(db, 'barcodes', barcode.trim());
        await setDoc(docRef, {
          name: name.trim(),
          uploadedAt: new Date().toISOString()
        });
        
        successCount++;
        console.log(`✓ Uploaded: ${barcode.trim()} - ${name.trim()}`);
        
        // Small delay to avoid overwhelming Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.error(`✗ Error uploading ${barcode}: ${error.message}`);
      }
    }
    
    console.log('\n=== Upload Complete ===');
    console.log(`Successfully uploaded: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the upload
uploadBarcodes();
