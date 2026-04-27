addEventListener(document.getElementById('submit-button'),async () => {
    const data = document.getElementsByClassName('loginForm');
    let responseData;
    try{
            responseData = await fetch('https://expense-tracker-api-5f8c.onrender.com/logIn', {
                method : POST,
                body : JSON.stringify(data)
            });
    }catch(error){
            if(responseData.status == 500){
                alert("Internal Server Error");
            }
            else if(responseData.status == 404){
                alert("Resource not found");
        }
    }
    if(responseData.status = 200){
        // update the url and set user as logged in
        window.location.href('');
    }
})