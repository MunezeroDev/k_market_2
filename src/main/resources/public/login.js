document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const formData = new URLSearchParams();
        formData.append('userName', username);
        formData.append('password', password);
        
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData,
            credentials: 'include'
        });
        
        const resultString = await response.text();
        const loginResult = JSON.parse(resultString);
        
        if (loginResult.success) {

            console.log('Login Sucessful:');

            document.getElementById('successMessage').textContent = 
                `Welcome back, ${loginResult.user.userName}!`;
            document.getElementById('successModal').classList.add('active');
            
            const roles = loginResult.roles;
            let redirectUrl = null;
            
            if (roles.includes('buyer') && !roles.includes('seller')) {
                redirectUrl = 'buyer_dashboard.html';
            } else if (roles.includes('seller') && !roles.includes('buyer')) {
                redirectUrl = 'seller_dashboard.html';
            } else if (roles.includes('buyer') && roles.includes('seller')) {
                redirectUrl = 'seller_dashboard.html';
            }
            
            if (redirectUrl) {
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
            } else {
                document.getElementById('successModal').style.display = 'none';
                document.getElementById('errorMessage').textContent = 
                    'No buyer or seller role assigned. Please contact administrator.';
                document.getElementById('errorModal').style.display = 'flex';
            }
            
        } else {
            document.getElementById('errorMessage').textContent = loginResult.message;
            document.getElementById('errorModal').classList.add('active');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMessage').textContent = 
            'An error occurred. Please try again.';
        document.getElementById('errorModal').style.display = 'flex';
    }
});

document.getElementById('closeError').addEventListener('click', () => {
    document.getElementById('errorModal').style.display = 'none';
});