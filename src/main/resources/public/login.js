document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // Send login request with form data
        const formData = new URLSearchParams();
        formData.append('userName', username);
        formData.append('password', password);
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        
        const resultString = await response.text();
        const loginResult = JSON.parse(resultString);
        
        if (loginResult.success) {
            // Store user data and roles in localStorage
            localStorage.setItem('user', JSON.stringify(loginResult.user));
            localStorage.setItem('roles', JSON.stringify(loginResult.roles));
            
            // Show success modal
            document.getElementById('successMessage').textContent = 
                `Welcome back, ${loginResult.user.userName}!`;
            document.getElementById('successModal').style.display = 'flex';
            
            // Auto redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } else {
            // Show error modal
            document.getElementById('errorMessage').textContent = loginResult.message;
            document.getElementById('errorModal').style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMessage').textContent = 
            'An error occurred. Please try again.';
        document.getElementById('errorModal').style.display = 'flex';
    }
});

// Close error modal
document.getElementById('closeError').addEventListener('click', () => {
    document.getElementById('errorModal').style.display = 'none';
});