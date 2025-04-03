if (sessionStorage.getItem("LoggedInUser") == undefined) {
    window.location.href = "../WEBSITE/loginScreen.html"
}

document.getElementById("ChangePassword").addEventListener("click", () => {
    window.location.href = "./ChangePassword/changepassword.html"
})


document.getElementById("LogOut").addEventListener("click", () => {
    sessionStorage.clear()
    window.location.href = "../WEBSITE/loginScreen.html"

})


document.getElementById("Settings").addEventListener("click", ()=>{
    window.location.href="../Settings/Settings Page.html"
})

document.getElementById("StartRun").addEventListener("click", () => {
    sessionStorage.setItem("GameState", JSON.stringify({
        energy: 100,
        time: 0,
        userName: sessionStorage.getItem('LoggedInUser'), 
        roomID: 5,
        inventory: []
    }))
    window.location.href = "../Game/Room5/room.html"
})


document.getElementById("Username").textContent = sessionStorage.getItem("LoggedInUser")

document.getElementById("ReturnHome").addEventListener("click", () => {
    window.location.href = "../WEBSITE/menu.html"
})

const DatabaseConnectionData = {
    url: 'https://phanisek01.webhosting1.eeecs.qub.ac.uk/dbConnector.php',
    hostname: "localhost",
    username: "phanisek01", // ! Enter own username
    password: "nDKM7BtMSYYxWc9F",// ! Enter own password
    database: "CSC1034_CW_17", // ! Change to group DB when uploading
}


/**
 * Sends a SQL query to the database defined at the start of the file
 * @param {string} SQLQuery 
 * @returns Promise. Successful if SQL query succeeds, Rejects if there is error at any part of the request
 */
async function executeDatabaseQuery(SQLQuery) {
    let params = new URLSearchParams();
    params.append('hostname', DatabaseConnectionData.hostname);
    params.append('username', DatabaseConnectionData.username);
    params.append('password', DatabaseConnectionData.password);
    params.append('database', DatabaseConnectionData.database);
    params.append('query', SQLQuery);

    const DBPromise = new Promise((resolve, reject) => {
        try {
            let fetchPromise = fetch(DatabaseConnectionData.url, {
                method: 'POST',
                body: params
            }); 
    
            fetchPromise.then((result) => {
                result.json().then((jsonResult) => {
                    if (jsonResult.error) {
                        console.log(jsonResult.error.toString());
                        // Passes result directly to not complicate handling result
                        reject(jsonResult)
                    }
                    else if (jsonResult.data) {
                        // Passes result directly to not complicate handling result
                        resolve(jsonResult)
                    }
                    else {
                        if (jsonResult.affected_rows !== undefined) {
                            resolve({
                                success: jsonResult.success,
                                affected_rows: jsonResult.affected_rows
                            })
                        } else {   
                            resolve({
                                success: jsonResult.success,
                            })
                        }
                    }
                }) 
            }) 
        } catch (error) {
            console.error('Error parsing JSON:', error);
            reject({
                error: true,
                errorReason: error
            })
        }
    })

    return DBPromise
}


document.getElementById('DeleteAccount').addEventListener('click', () => {
    let userConfirm = confirm("Are you sure you want to delete your account?")

    if (userConfirm) {
        executeDatabaseQuery(`DELETE FROM User WHERE Username = "${sessionStorage.getItem('LoggedInUser')}"`)
        sessionStorage.clear()
        window.location.href = "../WEBSITE/website.html"
    }
})