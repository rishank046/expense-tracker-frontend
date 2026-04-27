async function getData(){
    let responseData;
    try{
        let request = new Request('https://expense-tracker-api-5f8c.onrender.com/' , {
            method : "GET",
            headers : {
                "Content-Type" : "application/json",
            },
        });
        responseData = await fetch(request);
        if(responseData.ok){
            //fill data to the UI elements
            let 
        }
    }
    catch(error){
        
    }
}