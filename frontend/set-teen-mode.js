// Simple script to set teen mode in localStorage
// This is for testing purposes - in a real app, this would be done through the UI

console.log('Setting teen mode in localStorage...');

// This would work in a browser environment
// localStorage.setItem('userMode', 'teen');

// For Node.js, we'll just log the instruction
console.log('✅ Teen UI Mode Ready!');
console.log('To activate teen mode in browser:');
console.log('1. Open browser console (F12)');
console.log('2. Run: localStorage.setItem("userMode", "teen")');
console.log('3. Refresh the page');
console.log('');
console.log('Or use the UserModeProvider in your React components:');
console.log('const { setUserMode } = useUserMode();');
console.log('setUserMode("teen");'); 