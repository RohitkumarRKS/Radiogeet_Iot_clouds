const { spawn } = require('child_process');

console.log('🚀 Starting RadioGeet IoT Platform (Server & Client)...');

const server = spawn('npm', ['run', 'dev'], { cwd: './backend', shell: true, stdio: 'inherit' });
const client = spawn('npm', ['run', 'dev'], { cwd: './frontend', shell: true, stdio: 'inherit' });

process.on('SIGINT', () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit();
});
