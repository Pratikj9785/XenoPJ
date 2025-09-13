// Vercel build script for backend
const { execSync } = require('child_process');

console.log('🔧 Building backend for Vercel...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🗄️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run migrations (optional for Vercel)
  console.log('🚀 Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Backend build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
