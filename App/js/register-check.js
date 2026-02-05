// ============================================
// DASHBOARD AUTHENTICATION CHECK
// Add this script to your dashboard.html
// ============================================

// Supabase Configuration (same as register page)
const SUPABASE_URL = 'https://zmasdihyqjkgkfszhruc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptYXNkaWh5cWprZ2tmc3pocnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzE5NTksImV4cCI6MjA3NTQwNzk1OX0.ogWtpk1xfBpyasCvhqXDA0GGDFOjgHiX8yo8RoyKZ2E';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// CHECK AUTHENTICATION STATUS
// ============================================
(async function checkAuth(){
    try{
        // Get current session from Supabase
        const{ data:{ session }, error } = await supabase.auth.getSession();
        
        if (error){
            console.error('Auth check error:', error);
            redirectToLogin();
            return;
        }
        
        // If no session exists, redirect to login
        if (!session){
            redirectToLogin();
            return;
        }
        
        // User is authenticated - store user info for dashboard use
        window.currentUser = session.user;
        console.log('User authenticated:', session.user.email);
        
    } catch (error){
        console.error('Authentication error:', error);
        redirectToLogin();
    }
})();

// ============================================
// REDIRECT TO LOGIN
// ============================================
function redirectToLogin(){
    window.location.href = 'register.html';
}

// ============================================
// LOGOUT FUNCTION
// ============================================
async function logout(){
    try{
        const{ error } = await supabase.auth.signOut();
        
        if (error){
            throw error;
        }
        
        // Clear any stored data
        localStorage.removeItem('user');
        
        // Show success message if Toastify is available
        if (typeof Toastify !== 'undefined'){
            Toastify({
                text: "Logged out successfully",
                duration: 2000,
                gravity: "top",
                position: "right",
                style:{
                    background: "linear-gradient(to right, #22c55e, #16a34a)",
                }
            }).showToast();
        }
        
        // Redirect to login page
        setTimeout(() =>{
            window.location.href = 'register.html';
        }, 1000);
        
    } catch (error){
        console.error('Logout error:', error);
        alert('Logout failed: ' + error.message);
    }
}

// Make logout available globally
window.logout = logout;

// ============================================
// LISTEN FOR AUTH STATE CHANGES
// ============================================
supabase.auth.onAuthStateChange((event, session) =>{
    if (event === 'SIGNED_OUT'){
        redirectToLogin();
    } else if (event === 'TOKEN_REFRESHED'){
        console.log('Session refreshed');
    }
});