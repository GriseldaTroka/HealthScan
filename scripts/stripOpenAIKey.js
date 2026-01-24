// scripts/stripOpenAIKey.js
// Replace hardcoded OpenAI API keys in aiService.js with env-based reference

const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'src', 'services', 'aiService.js');

try {
  if (!fs.existsSync(targetPath)) {
    process.exit(0);
  }
  const content = fs.readFileSync(targetPath, 'utf8');
  const replaced = content.replace(
    /const\s+OPENAI_API_KEY\s*=\s*['\"][^'\"]+['\"];?/,
    "const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;"
  );

  if (replaced !== content) {
    fs.writeFileSync(targetPath, replaced, 'utf8');
    console.log('aiService.js: replaced hardcoded OPENAI_API_KEY');
  } else {
    console.log('aiService.js: no hardcoded OPENAI_API_KEY found');
  }
} catch (err) {
  console.error('stripOpenAIKey error:', err.message);
  process.exit(1);
}
