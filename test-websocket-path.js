const WebSocket = require('ws');

console.log('Testing WebSocket connections...');

// Test connection to /notifications path
console.log('\n1. Testing connection to ws://localhost:4000/notifications');
const ws1 = new WebSocket('ws://localhost:4000/notifications');

ws1.on('open', () => {
  console.log('✅ Connected to /notifications path successfully!');
  ws1.close();
});

ws1.on('error', (error) => {
  console.log('❌ Failed to connect to /notifications path:', error.message);
});

ws1.on('close', () => {
  console.log('🔌 Connection to /notifications closed');
  
  // Test connection to root path
  console.log('\n2. Testing connection to ws://localhost:4000/');
  const ws2 = new WebSocket('ws://localhost:4000/');
  
  ws2.on('open', () => {
    console.log('✅ Connected to root path successfully!');
    ws2.close();
  });
  
  ws2.on('error', (error) => {
    console.log('❌ Failed to connect to root path:', error.message);
  });
  
  ws2.on('close', () => {
    console.log('🔌 Connection to root closed');
    
    // Test connection to invalid path
    console.log('\n3. Testing connection to ws://localhost:4000/invalid');
    const ws3 = new WebSocket('ws://localhost:4000/invalid');
    
    ws3.on('open', () => {
      console.log('⚠️ Connected to invalid path (this should not happen)');
      ws3.close();
    });
    
    ws3.on('error', (error) => {
      console.log('✅ Correctly rejected invalid path:', error.message);
    });
    
    ws3.on('close', () => {
      console.log('🔌 Connection to invalid path closed');
      console.log('\n✨ WebSocket path testing completed!');
      process.exit(0);
    });
  });
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n⏰ Test timeout - make sure the server is running on port 4000');
  process.exit(1);
}, 10000);
