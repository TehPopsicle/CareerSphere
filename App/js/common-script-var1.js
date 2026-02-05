const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () =>{
  if (window.scrollY > 50){ // adjust scroll trigger
    navbar.classList.add('shrink');
  } else{
    navbar.classList.remove('shrink');
  }
});