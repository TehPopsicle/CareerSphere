
function toggleSidebar(){
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Add active state on click
document.querySelectorAll('.nav-link').forEach(link =>{
    link.addEventListener('click', function(e){
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});