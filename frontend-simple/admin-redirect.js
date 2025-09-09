// Add this to your main frontend after successful login
function checkAdminAccess(user) {
    if (user.role === 'admin' || user.role === 'teacher') {
        // Show admin portal link
        const adminLink = document.createElement('a');
        adminLink.href = '/admin.html';
        adminLink.className = 'btn btn-secondary';
        adminLink.textContent = user.role === 'admin' ? '👑 Admin Portal' : '👨‍🏫 Teacher Portal';
        adminLink.style.marginLeft = '1rem';
        
        document.querySelector('.nav-buttons').appendChild(adminLink);
    }
}

// Call this after successful login
// checkAdminAccess(currentUser);
