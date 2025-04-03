
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

document.getElementById("StartRun").addEventListener("click", async () => {
    const deleteSaveQuery = `DELETE FROM SaveFile WHERE Username = "${sessionStorage.getItem('LoggedInUser')}"`

    await executeDatabaseQuery(deleteSaveQuery)

    sessionStorage.setItem("GameState", JSON.stringify({
        energy: 100,
        time: 0,
        userName: sessionStorage.getItem('LoggedInUser'), 
        roomID: 5,
        inventory: []
    }))
    window.location.href = "../Game/Room5/room.html"
})

// Checks if a saved game exists for the current user.
async function checkForSave() {
    const userID = sessionStorage.getItem('LoggedInUser');
    if (!userID) {
        console.error("User ID not found in sessionStorage.");
        return;
    }
    
    // Query for the most recent save for this user.
    const query = `SELECT * FROM SaveFile WHERE UserName = '${userID}' ORDER BY SaveID DESC LIMIT 1`;
    try {
        const result = await executeDatabaseQuery(query);
        if (result.data && result.data.length > 0) {
            // A save exists; add a Resume Run button.
            addResumeRunButton(result.data[0]);
           
            let TimeDisplay = document.getElementById("PlayerTime")
            let timeSeconds = result.data[0].Time % 60
            let timeMinutes = Math.floor(result.data[0].Time / 60)
        
            let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
            TimeDisplay.textContent = TimerValue
        
            let EnergyDisplay = document.getElementById("PlayerEnergy")
            EnergyDisplay.textContent = result.data[0].Energy


        } else {
            console.log("No saved game found for this user.");
        }
    } catch (error) {
        console.error("Error checking for save:", error);
    }
}

// Creates and adds the "Resume Run" button to the page.
function addResumeRunButton(saveData) {
    const resumeButton = document.createElement("button");
    resumeButton.id = "ResumeRun";
    resumeButton.textContent = "Resume Run";
    
    // Append the button to a container on the account page.
    const container = document.getElementById("RunOptions");
    container.appendChild(resumeButton);
    
    // When clicked, resume the saved game using values from saveData.
    resumeButton.addEventListener("click", () => {
        sessionStorage.setItem("GameState", JSON.stringify({
            energy: Number(saveData.Energy), // For now, using a static value; you can update this to use dynamic data from saveData.
            time: Number(saveData.Time),
            userName: sessionStorage.getItem('LoggedInUser'),
            roomID: saveData.RoomID, // Resume at the saved room.
            inventory: [] // Later, you can also load inventory data.
        }));
        window.location.href = `../Game/Room${saveData.RoomID}/room.html`;
    });
}

// Run the check for an existing save when the account page loads.
window.addEventListener("load", () => {
    checkForSave();
});




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



document.getElementById('DeleteAccount').addEventListener('click', () => {
    let userConfirm = confirm("Are you sure you want to delete your account?")

    if (userConfirm) {
        executeDatabaseQuery(`DELETE FROM User WHERE Username = "${sessionStorage.getItem('LoggedInUser')}"`)
        sessionStorage.clear()
        window.location.href = "../WEBSITE/website.html"
    }
})

/**
 * Finds fastest escape time in seconds
 * @returns time in seconds or undefined if no completions saved for user
 */
async function getFastestTime() {
    const FinalRoom = 4
    const GetCompletionsQuery = `SELECT runtime_seconds FROM room_completions WHERE Username="${sessionStorage.getItem('LoggedInUser')}" AND room_number = ${FinalRoom} ORDER BY runtime_seconds ASC`

    try {
        let result = await executeDatabaseQuery(GetCompletionsQuery)
        if (result.data.length > 0) {
            let fastestTime = result.data[0].runtime_seconds
            return fastestTime
        } else {
            return undefined
        }
        
    } catch (error) {
        console.log(error)
        return undefined
    }    
}

/**
 * Finds fastest escape time in seconds
 * @returns time in seconds or undefined if no completions saved for user
 */
async function getFastestTime() {
    const FinalRoom = 4
    const GetCompletionsQuery = `SELECT runtime_seconds FROM room_completions WHERE Username="${sessionStorage.getItem('LoggedInUser')}" AND room_number = ${FinalRoom} ORDER BY runtime_seconds ASC`

    try {
        let result = await executeDatabaseQuery(GetCompletionsQuery)
        if (result.data.length > 0) {
            let fastestTime = result.data[0].runtime_seconds
            return fastestTime
        } else {
            return undefined
        }
        
    } catch (error) {
        console.log(error)
        return undefined
    }    
}

/**
 * Finds total escapes from user
 * @returns number of escapes
 */
async function getTotalCompletions() {
    const FinalRoom = 4
    const GetCompletionsQuery = `SELECT COUNT(*) FROM room_completions WHERE Username="${sessionStorage.getItem('LoggedInUser')}" AND room_number = ${FinalRoom}`

    try {
        let result = await executeDatabaseQuery(GetCompletionsQuery)
        if (result.data.length > 0) {
            let totalEscapes = result.data[0]["COUNT(*)"]
            return totalEscapes
        } else {
            return 0
        }
        
    } catch (error) {
        console.log(error)
        return 0
    }    
}


getFastestTime().then(time => {
    let timeSeconds = time % 60
    let timeMinutes = Math.floor(time / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`

    const FastestTimeSpan = document.getElementById("FastestTime")
    
    FastestTimeSpan.textContent = time ? TimerValue : "None";
    
})

getTotalCompletions().then(count => {
    const TotalEscapesSpan = document.getElementById("TotalEscapes")
    TotalEscapesSpan.textContent = count

})
