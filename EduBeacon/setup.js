const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up EduBeacon...\n');

// Check if .env exists in server directory
const envPath = path.join(__dirname, 'server', '.env');
const configPath = path.join(__dirname, 'server', 'config.env');

if (!fs.existsSync(envPath) && fs.existsSync(configPath)) {
  console.log('📝 Creating .env file from config.env...');
  fs.copyFileSync(configPath, envPath);
  console.log('✅ .env file created successfully!');
} else if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('⚠️  Please create a .env file in the server directory');
  console.log('   Copy config.env to .env and update with your credentials');
}

console.log('\n📦 Installing dependencies...');
console.log('   This may take a few minutes...\n');

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update server/.env with your MongoDB URI and Gemini API key');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\nHappy coding! 🎓');
