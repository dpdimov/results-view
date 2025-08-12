// Helper function to check if user is authenticated on the client side
export function checkClientAuth(): boolean {
  if (typeof window === 'undefined') return false;
  
  const adminAuth = localStorage.getItem('admin_authenticated');
  return adminAuth === 'true';
}

// Helper function to set client-side authentication
export function setClientAuth(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  
  if (authenticated) {
    localStorage.setItem('admin_authenticated', 'true');
  } else {
    localStorage.removeItem('admin_authenticated');
  }
}

// Helper function to logout
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('admin_authenticated');
  // Also clear the cookie by making a request
  fetch('/api/admin/logout', { method: 'POST' });
}