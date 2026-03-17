const toggleTheme = () => {
    const html = document.documentElement;
    const darkIcon = document.getElementById('dark-mode');
    const lightIcon = document.getElementById('light-mode');
    
    // Determine the new theme
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply theme to the root element
    html.setAttribute('data-theme', newTheme);
    
    // Toggle icon visibility
    if (newTheme === 'light') {
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    } else {
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    }
    
    // Optional: Save preference to localStorage
    localStorage.setItem('theme', newTheme);
};

// Initialize theme on page load
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const darkIcon = document.getElementById('dark-mode');
    const lightIcon = document.getElementById('light-mode');
    
    if (savedTheme === 'light') {
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    } else {
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    }
};

// Assuming you have a button or container with id="theme-toggle"
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Run on load
initTheme();