/**
 * Clear all frontend localStorage data
 * 
 * This script clears all stored data in localStorage:
 * - User session
 * - Bank flags
 * - Card extras
 * - Customers
 * - Suppliers
 * - POS terminals
 * 
 * Usage: Call this function from browser console or import and call in code
 */

export function clearAllLocalStorageData() {
  console.log('🧹 Clearing all localStorage data...');
  
  const keysToRemove = [
    'esca-webkasa-user',
    'esca-webkasa-bank-flags', // FIX: Use correct key with hyphens
    'esca-webkasa-card-extras', // FIX: Use correct key with hyphens
    'esca-webkasa-customers',
    'esca-webkasa-suppliers',
    'esca-webkasa-pos-terminals',
  ];

  let removedCount = 0;
  keysToRemove.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✓ Removed: ${key}`);
    }
  });

  // Also clear any other keys that start with 'esca-webkasa-'
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (key.startsWith('esca-webkasa-') && !keysToRemove.includes(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✓ Removed (additional): ${key}`);
    }
  });

  console.log(`✅ Cleared ${removedCount} localStorage items`);
  console.log('🔄 Please refresh the page to see the changes.');
  
  return removedCount;
}

/**
 * Clear ALL data (backend + frontend)
 * This function calls the backend API to clear all database data
 * and also clears localStorage
 */
export async function clearAllData() {
  console.log('🗑️  Clearing ALL data (backend + frontend)...');
  
  try {
    // Clear backend data
    console.log('📡 Clearing backend data...');
    const response = await fetch('http://localhost:4000/api/admin/clear-all-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend clear failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Backend data cleared:', result);

    // Clear frontend localStorage
    console.log('💾 Clearing frontend localStorage...');
    const removedCount = clearAllLocalStorageData();

    console.log('');
    console.log('✅ All data cleared successfully!');
    console.log(`   - Backend: All tables cleared`);
    console.log(`   - Frontend: ${removedCount} localStorage items cleared`);
    console.log('');
    console.log('🔄 Please refresh the page to see the changes.');

    return { backend: result, frontend: removedCount };
  } catch (error: any) {
    console.error('❌ Error clearing data:', error);
    
    // If backend is not available, just clear localStorage
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      console.log('⚠️  Backend not available, clearing localStorage only...');
      const removedCount = clearAllLocalStorageData();
      return { backend: null, frontend: removedCount };
    }
    
    throw error;
  }
}

// Auto-execute if run directly in browser console
if (typeof window !== 'undefined') {
  // Make it available globally for easy access
  (window as any).clearAllData = clearAllData;
  (window as any).clearAllLocalStorageData = clearAllLocalStorageData;
}

