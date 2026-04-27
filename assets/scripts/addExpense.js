async function addExpense(){
    //get form data
    let formData;
    try{
        let request = await fetch('https://expense-tracker-api-5f8c.onrender.com/',{
            method : "POST",
            headers : {
                'credentials' : 'include',
            },
            data : JSON.stringify(formData),
        });
    }catch(error){

    }
}