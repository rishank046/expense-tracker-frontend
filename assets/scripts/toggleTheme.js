const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const darkIcon = document.getElementById('dark-mode');
    const lightIcon = document.getElementById('light-mode');
    
    if (theme === 'light') {
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    } else {
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    }
};

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Load Preference
applyTheme(localStorage.getItem('theme') || 'dark');