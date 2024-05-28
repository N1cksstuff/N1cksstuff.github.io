document.querySelector('.user-menu-icon').addEventListener('click', function() {
    var menuContent = document.querySelector('.user-menu-content');
    menuContent.classList.add('animate__fadeIn');
    var userMenu = document.querySelector('.user-menu-icon');
    menuContent.classList.toggle('show');
    userMenu.classList.toggle('hidden');
}); 
// show user menu, hide user icon

document.querySelector('.close-user-menu').addEventListener('click', function() {
    var menuContent = document.querySelector('.user-menu-content');
    var userMenu = document.querySelector('.user-menu-icon');
    menuContent.classList.remove('show');
    userMenu.classList.remove('hidden');
}); 
// hide user menu, show user icon