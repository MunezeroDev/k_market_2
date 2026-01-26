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
            body: formData,
            credentials: 'include' // Important: include cookies in request
        });
        
        const resultString = await response.text();
        const loginResult = JSON.parse(resultString);
        
        if (loginResult.success) {

            console.log('Login Sucessful:');

            // Show success modal
            document.getElementById('successMessage').textContent = 
                `Welcome back, ${loginResult.user.userName}!`;
            document.getElementById('successModal').style.display = 'flex';
            
            // Determine which dashboard to redirect to based on roles
            const roles = loginResult.roles;
            let redirectUrl = null;
            
            if (roles.includes('buyer') && !roles.includes('seller')) {
                // Pure buyer - go to buyer dashboard
                redirectUrl = 'buyer_dashboard.html';
            } else if (roles.includes('seller') && !roles.includes('buyer')) {
                // Pure seller - go to seller dashboard
                redirectUrl = 'seller_dashboard.html';
            } else if (roles.includes('buyer') && roles.includes('seller')) {
                // Has both roles - prioritize seller dashboard
                redirectUrl = 'seller_dashboard.html';
            }
            
            // Redirect if we have a valid URL
            if (redirectUrl) {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
            } else {
                // No buyer or seller role - show error
                document.getElementById('successModal').style.display = 'none';
                document.getElementById('errorMessage').textContent = 
                    'No buyer or seller role assigned. Please contact administrator.';
                document.getElementById('errorModal').style.display = 'flex';
            }
            
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