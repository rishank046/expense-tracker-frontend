async function fetchExpenses(){
let responseData;
    try{
        let request = new Request('https://expense-tracker-api-5f8c.onrender.com/getExpense' , {
            method : "GET",
            mode : "cors",
            credentials : "same-origin",
        });
        responseData = await fetch(request);
        if(responseData.ok){
            //fill data to the UI elements
            let responseJson = await responseData.json();
            console.log(responseJson)
            for(let i = 0; i < responseJson.length; i++){
                let expense = responseJson[i];
                const tableRow = document.createElement('tr');
                tableRow.innerHTML = `
                    <td>${expense.id}</td>
                    <td>${expense.description}</td>
                    <td>${expense.amount}</td>
                `;
                document.getElementById('expense-table-body').appendChild(tableRow);
            }
        }
    }
    catch(error){
        console.error('Error fetching expenses:', error);
    }
}

fetchExpenses();