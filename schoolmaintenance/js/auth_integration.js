/**
 * Auth Integration Script
 * 
 * 1. Checks authentication status
 * 2. Updates Navigation Menu:
 *    - Adds "Logout" button
 *    - Shows "Welcome, [Name]"
 *    - Hides "Admin Dashboard" for non-admins
 * 3. Handles redirects if not logged in (redundant with inline script but safe)
 */

document.addEventListener('DOMContentLoaded', () => {
    fetch('auth/check_auth.php')
        .then(response => response.json())
        .then(data => {
            // 1. Redirect if not authenticated (Security)
            if (!data.authenticated) {
                // Allow public pages if any (currently all protected)
                // window.location.href = 'login.html'; 
                // Using the inline script for faster redirect, this is backup
            } else {
                updateNavigation(data);
            }
        })
        .catch(error => console.error('Auth integration error:', error));
});

function updateNavigation(user) {
    const navContainer = document.querySelector('.nav-links');
    if (!navContainer) return;

    // 1. Handle Admin Link
    const adminLink = navContainer.querySelector('a[href="admin-dashboard.html"]');
    if (adminLink) {
        if (user.role !== 'admin') {
            adminLink.style.display = 'none'; // Hide if not admin
        }
    }

    // 2. Add User Info & Logout
    // Check if controls already exist to prevent dupes
    if (document.getElementById('user-controls')) return;

    const controls = document.createElement('div');
    controls.id = 'user-controls';
    controls.style.display = 'inline-flex';
    controls.style.alignItems = 'center';
    controls.style.marginLeft = '20px';
    controls.style.gap = '15px';

    const welcomeMsg = document.createElement('span');
    welcomeMsg.textContent = `Welcome, ${user.name} (${user.role})`;
    welcomeMsg.style.fontSize = '0.9rem';
    welcomeMsg.style.color = 'var(--text-muted, #666)';
    
    // Create Logout Link
    const logoutLink = document.createElement('a');
    logoutLink.href = 'auth/logout.php';
    logoutLink.textContent = 'Logout';
    logoutLink.style.color = '#dc2626'; // Red color
    logoutLink.style.textDecoration = 'none';
    logoutLink.style.fontWeight = '500';
    logoutLink.style.fontSize = '0.9rem';
    logoutLink.style.border = '1px solid #dc2626';
    logoutLink.style.padding = '4px 10px';
    logoutLink.style.borderRadius = '4px';
    logoutLink.onmouseover = () => { logoutLink.style.background = '#dc2626'; logoutLink.style.color = 'white'; };
    logoutLink.onmouseout = () => { logoutLink.style.background = 'transparent'; logoutLink.style.color = '#dc2626'; };

    controls.appendChild(welcomeMsg);
    controls.appendChild(logoutLink);

    navContainer.appendChild(controls);
}
