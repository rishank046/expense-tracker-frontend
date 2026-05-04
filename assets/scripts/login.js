// 1. Correct the Event Listener syntax
const submitBtn = document.getElementsByClassName('submit-button');

submitBtn.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the page from reloading

    const loginForm = document.querySelector('.loginForm');
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());
    let response;

    try {
        response = await fetch('https://expense-tracker-api-5f8c.onrender.com/logIn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
    });

        const result = await response.json();
        console.log(result);

        if (result.status === 200) {
            window.location.href = '/index.html';
        } else {
            alert(`Error: ${result.message || 'Login failed'}`);
        }

    } catch (error) {
        console.error("Network error:", error);
        alert("Could not connect to the server.");
    }
});