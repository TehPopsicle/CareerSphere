// ============================================
// SUPABASE CONFIGURATION
// ============================================
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://zmasdihyqjkgkfszhruc.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXNkaWh5cWprZ2tmc3pocnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzE5NTksImV4cCI6MjA3NTQwNzk1OX0.ogWtpk1xfBpyasCvhqXDA0GGDFOjgHiX8yo8RoyKZ2E';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// TOASTIFY HELPER FUNCTION
// ============================================
function showToast(message, type = 'success'){
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style:{
            background: type === 'success' 
                ? "linear-gradient(to right, #22c55e, #16a34a)" 
                : "linear-gradient(to right, #ef4444, #dc2626)",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
        }
    }).showToast();
}

// ============================================
// EMAIL VALIDATION
// ============================================
function validateEmail(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// PASSWORD VALIDATION
// ============================================
function validatePassword(password){
    return password.length >= 6;
}

// ============================================
// TAB SWITCHING (LOGIN/SIGNUP)
// ============================================
$(document).ready(function(){
    // Initially set login as active
    $('#login').addClass('active');
    
    // Login tab click
    $('#login').click(function(){
        $(this).addClass('active');
        $('#signup').removeClass('active');
        $('.login').removeClass('hidden');
        $('.signup').addClass('hidden');
    });
    
    // Signup tab click
    $('#signup').click(function(){
        $(this).addClass('active');
        $('#login').removeClass('active');
        $('.signup').removeClass('hidden');
        $('.login').addClass('hidden');
    });
    
    // ============================================
    // QUOTE SLIDER
    // ============================================
    let currentQuoteIndex = 0;
    const quotes = $('.quote-slider');
    const totalQuotes = quotes.length;
    
    function showQuote(index){
        quotes.removeClass('active');
        $(quotes[index]).addClass('active');
    }
    
    // Next button
    $('.forward').click(function(){
        currentQuoteIndex = (currentQuoteIndex + 1) % totalQuotes;
        showQuote(currentQuoteIndex);
    });
    
    // Previous button
    $('.back').click(function(){
        currentQuoteIndex = (currentQuoteIndex - 1 + totalQuotes) % totalQuotes;
        showQuote(currentQuoteIndex);
    });
    
    // Auto-rotate quotes every 6 seconds
    setInterval(function(){
        currentQuoteIndex = (currentQuoteIndex + 1) % totalQuotes;
        showQuote(currentQuoteIndex);
    }, 6000);
    
    // ============================================
    // LOGIN FORM SUBMISSION
    // ============================================
    $('#login-form').submit(async function(e){
        e.preventDefault();
        
        const email = $('#login-email').val().trim();
        const password = $('#login-pass').val();
        const loginBtn = $('#login-btn');
        
        // Validation
        if (!validateEmail(email)){
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePassword(password)){
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Disable button and show loading
        loginBtn.prop('disabled', true).addClass('loading').text('Signing in...');
        
        try{
            // Sign in with Supabase
            const{ data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error){
                throw error;
            }
            
            // Success
            showToast('Login successful! Welcome back.', 'success');
            
            // Store user session
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard after 1 second
            setTimeout(() =>{
                window.location.href = 'dashboard.html'; // Change to your dashboard page
            }, 1000);
            
        } catch (error){
            console.error('Login error:', error);
            
            // Show appropriate error message
            if (error.message.includes('Invalid login credentials')){
                showToast('Invalid email or password', 'error');
            } else if (error.message.includes('Email not confirmed')){
                showToast('Please verify your email before logging in', 'error');
            } else{
                showToast('Login failed: ' + error.message, 'error');
            }
            
        } finally{
            // Re-enable button
            loginBtn.prop('disabled', false).removeClass('loading').text('Log In');
        }
    });
    
    // ============================================
    // SIGNUP FORM SUBMISSION
    // ============================================
    $('#signup-form').submit(async function(e){
        e.preventDefault();
        
        const name = $('#signup-name').val().trim();
        const email = $('#signup-email').val().trim();
        const password = $('#signup-pass').val();
        const confirmPassword = $('#confirm-pass').val();
        const signupBtn = $('#signup-btn');
        
        // Validation
        if (name.length < 2){
            showToast('Please enter your full name', 'error');
            return;
        }
        
        if (!validateEmail(email)){
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePassword(password)){
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword){
            showToast('Passwords do not match', 'error');
            return;
        }
        
        // Disable button and show loading
        signupBtn.prop('disabled', true).addClass('loading').text('Creating account...');
        
        try{
            // Sign up with Supabase
            const{ data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options:{
                    data:{
                        full_name: name
                    }
                }
            });
            
            if (error){
                throw error;
            }
            
            // Success
            showToast('Account created successfully! Please check your email to verify.', 'success');
            
            // Clear form
            $('#signup-form')[0].reset();
            
            // Switch to login tab after 2 seconds
            setTimeout(() =>{
                $('#login').click();
            }, 2000);
            
        } catch (error){
            console.error('Signup error:', error);
            
            // Show appropriate error message
            if (error.message.includes('already registered')){
                showToast('This email is already registered', 'error');
            } else if (error.message.includes('Password')){
                showToast('Password is too weak. Use at least 6 characters.', 'error');
            } else{
                showToast('Signup failed: ' + error.message, 'error');
            }
            
        } finally{
            // Re-enable button
            signupBtn.prop('disabled', false).removeClass('loading').text('Sign Up');
        }
    });
    
    // ============================================
    // CHECK IF USER IS ALREADY LOGGED IN
    // ============================================
    async function checkAuthStatus(){
        const{ data:{ session } } = await supabase.auth.getSession();
        
        if (session){
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    }
    
    // Check auth status on page load
    checkAuthStatus();
    
    // ============================================
    // LISTEN FOR AUTH STATE CHANGES
    // ============================================
    supabase.auth.onAuthStateChange((event, session) =>{
        if (event === 'SIGNED_IN'){
            console.log('User signed in:', session.user);
        } else if (event === 'SIGNED_OUT'){
            console.log('User signed out');
        }
    });
});


document.cookie = "userLoggedIn=true; path=/; max-age=86400";
// ============================================
// LOGOUT FUNCTION (for use in dashboard)
// ============================================
async function logout(){
    try{
        const{ error } = await supabase.auth.signOut();
        
        if (error){
            throw error;
        }
        
        // Clear local storage
        localStorage.removeItem('user');
        
        showToast('Logged out successfully', 'success');
        
        // Redirect to login page
        setTimeout(() =>{
            window.location.href = 'register.html';
        }, 1000);
        
    } catch (error){
        console.error('Logout error:', error);
        showToast('Logout failed: ' + error.message, 'error');
    }
}

// Make logout function available globally
window.logout = logout;