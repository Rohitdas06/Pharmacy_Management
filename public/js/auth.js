// API Base URL
const API_URL = 'http://localhost:3000/api/auth';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toast = document.getElementById('toast');

// Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');
        const btnText = document.getElementById('loginText');
        const loader = document.getElementById('loginLoader');

        setLoading(btn, btnText, loader, true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showToast('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            showToast(error.message, 'error');
            setLoading(btn, btnText, loader, false);
        }
    });
}

// Signup Handler
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        const btn = signupForm.querySelector('button');
        const btnText = document.getElementById('signupText');
        const loader = document.getElementById('signupLoader');

        // Validation
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(btn, btnText, loader, true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showToast('Account created! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            showToast(error.message, 'error');
            setLoading(btn, btnText, loader, false);
        }
    });
}

// Helper Functions
function setLoading(btn, text, loader, isLoading) {
    if (isLoading) {
        btn.disabled = true;
        text.style.display = 'none';
        loader.style.display = 'block';
    } else {
        btn.disabled = false;
        text.style.display = 'block';
        loader.style.display = 'none';
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Check if already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token validity (optional, but good practice)
        // For now, just redirect if token exists on auth pages
        if (window.location.pathname.includes('login.html') ||
            window.location.pathname.includes('signup.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // Redirect to login if trying to access protected pages
        if (!window.location.pathname.includes('login.html') &&
            !window.location.pathname.includes('signup.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Run auth check on load
document.addEventListener('DOMContentLoaded', () => {
    // Only run checkAuth if we're not on the auth pages to prevent infinite loops
    // Logic handled inside checkAuth
    const isAuthPage = window.location.pathname.includes('login.html') ||
        window.location.pathname.includes('signup.html');

    if (isAuthPage) {
        const token = localStorage.getItem('token');
        if (token) window.location.href = 'index.html';
    }
});
