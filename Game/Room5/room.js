const password = "escape while you can";
const decoded_password = "pdnlap hstwp jzf nly";

// Caesar cipher encoding function
function caesarCipher(str, shift) {
    return str.replace(/[a-z]/gi, (char) => {
        const offset = char === char.toUpperCase() ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - offset + shift) % 26 + 26) % 26 + offset);
    });
}

// Clears all options from the UserOptions container
function ClearOptions() {
    const optionsContainer = document.getElementById("UserOptions");
    if (optionsContainer) {
        optionsContainer.innerHTML = "";
    }
}

// Dynamically adds an option button
function AddOption(optionText, action) {
    const optionsContainer = document.getElementById("UserOptions");
    if (optionsContainer) {
        const button = document.createElement("button");
        button.textContent = optionText;
        button.addEventListener("click", action);
        optionsContainer.appendChild(button);
    }
}

// // Displays a message in the Message container
// function ShowMessage(messageText) {
//     const messageContainer = document.getElementById("Message");
//     if (messageContainer) {
//         messageContainer.style.display = "block";
//         messageContainer.querySelector("h1").textContent = messageText;
//     }
// }

// Display the main room description and buttons
function displayRoomDescription() {
   
    console.log("displayRoomDescription called");

    if (typeof ShowMessage !== "function" || typeof AddOption !== "function") {
        console.error("Core game functions not available");
        return;
    }

    ShowMessage("In the room, you see a wardrobe with locked drawers, a note on top of the drawers, and a door with a strange lock on it.");

    // Restore main options
    ClearOptions();
    AddOption("Look at Note", lookAtNote);
    AddOption("Try to Open Drawers", tryOpenDrawers);
    AddOption("Inspect Lock", inspectLock);
}


function lookAtNote() {
    console.log("lookAtNote called");
    ClearOptions();

    const optionsContainer = document.getElementById("FocusedObject");

    // Create a container for the note with the scroll image as background
    const noteContainer = document.createElement("div");
    noteContainer.style.position = "relative";
    noteContainer.style.width = "360px";
    noteContainer.style.height = "360px";
    noteContainer.style.backgroundImage = "url('Assets/scroll_no_bg.png')";
    noteContainer.style.backgroundSize = "cover";
    noteContainer.style.padding = "20px";
    noteContainer.style.color = "black";
    noteContainer.style.fontFamily = "monospace";

    // Paragraph to display the cipher
    const noteParagraph = document.createElement("p");
    noteParagraph.style.position = "absolute";
    

    noteParagraph.style.top = "70px";
    noteParagraph.style.left = "120px";

    noteContainer.appendChild(noteParagraph);
    optionsContainer.appendChild(noteContainer);

    let isNoteFlipped = false; // Track whether the note is flipped.

    // Function to display the cipher based on note side
    function updateCipher() {
        let noteContent = "";
        for (let i = 0; i < 13; i++) {
            // Change the Caesar shift based on note side.
            const decoded = caesarCipher(decoded_password, isNoteFlipped ? 13 + i : 13 - i);
            noteContent += `${decoded}<br>`;
        }
        noteParagraph.innerHTML = noteContent;
    }

    // Initial display of the note.
    ShowMessage("The note has some random letters on it and it's double-sided.");
    updateCipher();

    // Button: Flip Note
    AddOption("Flip Note", () => {
        isNoteFlipped = !isNoteFlipped; // Toggle the note side.
        updateCipher(); // Refresh cipher display.
    });

    // Button: Back 
    AddOption("Back", () => {
        optionsContainer.innerHTML = ""; // Clear the note content.
        displayRoomDescription(); // Return to the room description.
    });
} 



// Try to open drawers - displays a locked message
function tryOpenDrawers() {
    console.log("tryOpenDrawers called");
    ShowMessage("The drawers are locked. You should look around the room more.");
}

// Inspect the lock - shows the lock and input field with a **random shift**
function inspectLock() {
    console.log("inspectLock called");
    ClearOptions();

    const optionsContainer = document.getElementById("FocusedObject");
    const lockDiv = document.createElement("div");
    lockDiv.style.position = "relative";
    lockDiv.style.width = "360px";
    lockDiv.style.height = "360px";
    lockDiv.style.backgroundImage = "url('Assets/doorlock.webp')";
    lockDiv.style.backgroundSize = "cover";
    lockDiv.style.padding = "20px";
    lockDiv.style.color = "black";
    lockDiv.style.fontFamily = "monospace";

    optionsContainer.appendChild(lockDiv);

  

    ShowMessage("A lock with a strange note appears above the lock.");
   

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter code";
    document.getElementById("UserOptions").appendChild(input);

    AddOption("Submit", () => {
        if (input.value.toLowerCase() === password) {
            ShowMessage("Correct! The lock opens.");
            NextRoom();
        } else {
            ShowMessage("Incorrect. Try again.");
        }
    });

    AddOption("Back", () => {
        optionsContainer.innerHTML = "";
        displayRoomDescription();
    });
}

function NextRoom() {
    console.log("Next Room Called");
    ClearOptions();

    AddOption("Next Room", () =>{
        TransitionToRoom(3) //change this so that it takes you ton the next room change location only
    });

}
/*
* Boilerplate code 
*/

let GameState = {
    energy: 100,
    time: 0,
    userName: sessionStorage.getItem('LoggedInUser'), 
    roomID: 5,
    inventory: []
  }

let TimerInterval = undefined


const DatabaseConnectionData = {
    url: 'https://phanisek01.webhosting1.eeecs.qub.ac.uk/dbConnector.php',
    hostname: "localhost",
    username: "phanisek01", // ! Enter own username
    password: "nDKM7BtMSYYxWc9F",// ! Enter own password
    database: "CSC1034_CW_17", // ! Change to group DB when uploading
}

/**
 * Updates room name in info bar
 * @param {string} roomName 
 */
function SetRoomName(roomName) {
    let roomNameDisplay = document.getElementById("RoomName")
    roomNameDisplay.textContent = roomName
}

/**
 * Adds option for user to select their next action
 * @param {string} OptionTitle 
 * @param {function} OptionAction 
 */
function AddOption(OptionTitle, OptionAction) {
    let Options = document.getElementById("UserOptions")
    let NewOption = document.createElement("div")
    NewOption.className = "UserOption"

    let NewOptionTitle = document.createElement("h1")
    NewOptionTitle.textContent = OptionTitle
    NewOption.appendChild(NewOptionTitle)
    NewOption.style.display="none";
    NewOption.addEventListener("click", OptionAction)
    
    
    Options.appendChild(NewOption)
    loadSetting();

    setTimeout(()=>{
        NewOption.style.display="block";
    },68.5)
}

/**
 * Removes all options from user
 * @param {string=} emptyMessage Optional Message to show instead of options
 */
function ClearOptions(emptyMessage) {
    let Options = document.getElementById("UserOptions")
    Options.replaceChildren([])

    // Adds message if provided
    if (emptyMessage != undefined && emptyMessage.length > 0) {
        let message = document.createElement('h1')
        message.textContent = emptyMessage
        Options.appendChild(message)
    }
    
}

/**
 * Sets the background image of the player's game view
 * @param {string} ImageURL 
 */
function SetBackgroundImage(ImageURL) {
    let Background = document.getElementById("GameView")
    Background.style.backgroundImage = `url(${ImageURL})`   
}

/**
 * Gets stored timer value and updates info bar
 */
function UpdateTimerDisplay() {
    let TimeDisplay = document.getElementById("PlayerTime")
    let timeSeconds = GameState.time % 60
    let timeMinutes = Math.floor(GameState.time / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
    TimeDisplay.textContent = TimerValue
}

/**
 * Get's current stored player energy and updates info bar
 */
function UpdateEnergyDisplay() {
    let EnergyDisplay = document.getElementById("PlayerEnergy")
    EnergyDisplay.textContent = GameState.energy
}

/**
 * Removes energy from player, ensuring it doesn't go negative and fails game if energy drops to 0
 * @param {integer} amount 
 * @returns False if amount is greater than current player energy. True otherwise
 */
function RemoveEnergy(amount) {
    if (amount > GameState.energy) return false

    GameState.energy -= amount

    if (GameState.energy === 0) {
        FailGame(2)
    }
    UpdateEnergyDisplay()
    return true
}

/**
 * Adds energy to player
 * @param {integer} amount 
 * @returns False if amount would increase player energy above 100. True otherwise
 */
function AddEnergy(amount) {
    if (GameState.energy + amount > 100) return false

    GameState.energy += amount

    UpdateEnergyDisplay()
    return true
}

/**
 * Transitions to another room safely, ensuring data is saved to transfer to new room
 * @param {integer} roomNumber 
 */
function TransitionToRoom(roomNumber) {
    // Cleared to ensure timer doesn't tick while user is waiting for room to load
    clearInterval(TimerInterval)

    sessionStorage.setItem('GameState', JSON.stringify(GameState))
    saveGame(GameState)

    window.location.href = `../Room${roomNumber}/room.html`
}

/**
 * Fails the player for their current run
 * @param {integer} reason 1 - Ran out of time | 2 - Ran out of energy
 */
function FailGame(reason) {
    let GameWindow = document.getElementById("GameWindow")
    if (reason === 1) {
        const TimeFailPopup = '<div id="Overlay"><div id="OverlayMessage"><h1>You\'ve ran out of time</h1><div style="display: flex; justify-content: space-around; max-width: 500px; width: 100%;"><button class="OverlayButton" id="NewRunButton">New Run</button><button class="OverlayButton" id="ReturnHomeButton">Return to Home</button></div></div></div>'
        GameWindow.insertAdjacentHTML('beforeend', TimeFailPopup)
        
    } else {
        const EnergyFailPopup = '<div id="Overlay"><div id="OverlayMessage"><h1>You\'ve ran out of energy</h1><div style="display: flex; justify-content: space-around; max-width: 500px; width: 100%;"><button class="OverlayButton" id="NewRunButton">New Run</button><button class="OverlayButton" id="ReturnHomeButton">Return to Home</button></div></div></div>'
        GameWindow.insertAdjacentHTML('beforeend', EnergyFailPopup)
    }
    let NewRunButton = document.getElementById("NewRunButton")

    NewRunButton.addEventListener('click', () => {
        window.removeEventListener('beforeunload', onPageLeave)
        sessionStorage.removeItem('GameState')
        window.location.href = "../Room5/room.html"
    })

    let ReturnHomeButton = document.getElementById("ReturnHomeButton")

    ReturnHomeButton.addEventListener('click', () => {
        window.removeEventListener('beforeunload', onPageLeave)
        sessionStorage.removeItem('GameState')
        
        window.location.href = "../../WEBSITE/website.html"
    })

    clearInterval(TimerInterval)
}

/**
 * Pauses the timer and displays a pause menu
 */
function PauseGame() {
    let GameWindow = document.getElementById("GameWindow")

    const PauseMenuPopup = '<div id="Overlay"><div id="OverlayMessage"><h1>Game Paused</h1><h2>Current Time : <span id="PauseScreenTime"></span></h2><div style="display: flex; justify-content: space-around; width: 100%;"><button class="OverlayButton" id="ResumeButton">Resume</button><button class="OverlayButton" id="ReturnHomeButton">Return to Home</button><button class="OverlayButton" id="SaveButton">Save</button></div></div></div>'
    GameWindow.insertAdjacentHTML('beforeend', PauseMenuPopup)

    let resumeButton = document.getElementById('ResumeButton')
    resumeButton.addEventListener('click', ResumeGame)

    let pauseTimeDisplay = document.getElementById('PauseScreenTime')
    let timeSeconds = GameState.time % 60
    let timeMinutes = Math.floor(GameState.time / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
    let ReturnHomeButton = document.getElementById("ReturnHomeButton")
    ReturnHomeButton.addEventListener('click', () => {
        window.location.href = "../../WEBSITE/website.html"
    })
    
    let saveButton = document.getElementById('SaveButton')
    saveButton.addEventListener('click', () => saveGame(GameState))


    pauseTimeDisplay.textContent = TimerValue

    clearInterval(TimerInterval)
}

/**
 * Resumes the game timer and removes the pause menu overlay
 */
function ResumeGame() {
    StartTimer()
    let GameWindow = document.getElementById("GameWindow")
    let Overlay = GameWindow.lastChild
    
    GameWindow.removeChild(Overlay)
}
 


function StartTimer() {
    TimerInterval = setInterval(() => {
        GameState.time += 1
        UpdateTimerDisplay()

        const FiveMinutes = 5 * 60

        if (GameState.time > FiveMinutes) {
            FailGame(1)
        }
    }, 1000)

}


/**
 * Syncs room with current player data and starts timer
 * Separated to ensure boilerplate code remains unedited
 */
function InitRoom() {
    document.getElementById("PauseButton").addEventListener('click', PauseGame)

    if (sessionStorage.getItem('LoggedInUser') == undefined) {
        window.location.href = "../../WEBSITE/loginScreen.html"
    }

    let loadedGameState = JSON.parse(sessionStorage.getItem('GameState'))

    if (sessionStorage.getItem('GameState') == undefined) {
        window.location.href = "../../WEBSITE/loginScreen.html"
    }

    GameState.energy = loadedGameState.energy
    GameState.time = loadedGameState.time
    GameState.inventory = loadedGameState.inventory

    UpdateEnergyDisplay()    
    StartTimer()
    
    StartRoom()
}

window.addEventListener('load', InitRoom)


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

/**
 * Shows a message in the predefined message popup
 * @param {string} messageText 
 */
function ShowMessage(messageText) {
    let message = document.getElementById("Message")
    message.style.display = "block"
    message.children[0].textContent = messageText
}

/**
 * Hides the message popup from the user
 */
function HideMessage() {
    let message = document.getElementById("Message")

    message.style.display = "none"
}

/**
 * Removes options bar from user to allow for more room for UI
 */
function HideOptions() {
    let OptionsBar = document.getElementById("UserOptions")
    OptionsBar.style.display = "none;"

    let GameWindow = document.getElementById("GameWindow")
    GameWindow.style.gridTemplateRows = "100%"

    let GameView = document.getElementById("GameView")
    GameView.style.gridTemplateRows = "9.6% 78.4% 12%"
}

/**
 * Shows options bar to user
 */
function ShowOptions() {
    let OptionsBar = document.getElementById("UserOptions")
    OptionsBar.style.display = ""

    let GameWindow = document.getElementById("GameWindow")
    GameWindow.style.gridTemplateRows = ""

    let GameView = document.getElementById("GameView")
    GameView.style.gridTemplateRows = ""
}

// Prevents reloading to regain time
const onPageLeave = () => {
    sessionStorage.setItem('GameState', JSON.stringify(GameState))
    saveGame(GameState)
}
window.addEventListener('beforeunload', onPageLeave)

/* 
* Boilerplate code end
*/
//EDIT BELOW HERE
// Caesar cipher encoding function


function checkPassword() {
    const userInput = document.getElementById("userInput").value.toLowerCase();
    const message = document.getElementById("message");

    if (userInput === password) {
        message.textContent = "Correct! You have escaped the room.";
    } else {
        message.textContent = "Incorrect password. Try again.";
    }
}

function goBack() {
    window.location.href = 'menu.html'; // Adjust to your menu page
}



// Function to display the popup with the result of another function
function showPopup() {
    const content = myFunction();
    document.getElementById("popupContent").textContent = content;
    document.getElementById("popup").style.display = "block";
}

// Function to hide the popup
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Example function to display something in the popup
function myFunction() {
    return "Hello, this is your popup!";
}

// Attach event listener to the button
// document.getElementById("showPopup").addEventListener("click", showPopup);


// function tryOpenDrawers() {
//     ShowMessage("The drawers are locked. You should look around the room more.");
// }







/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    
    

    // AddOption("Show Options", () => ShowMessage('New Option'))
    // AddOption("Hide Options", () => {
    //     HideOptions();
    //     setTimeout(ShowOptions, 1000);
        
    // })
    // AddOption("Show Object", () => ShowObject(`https://imgs.search.brave.com/Uv7PjPwToss4YP4krNPTTauC8y1Iq7BXFAWSoknkpAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/ODE0LzU2Ny9zbWFs/bC9yb2xsLW9mLXll/bGxvdy1zY290Y2gt/dGFwZS0zZC1oaWdo/LXF1YWxpdHktcGhv/dG8tcG5nLnBuZw`))
    // AddOption("Hide Object", () => HideObject())
    // AddOption("Clear Options", () => ClearOptions("You may not make an action now"))
    // AddOption("Clear Options", () => ClearOptions())

    // AddOption("Add Energy", () => AddEnergy(5))
    // AddOption("Remove Energy", () => RemoveEnergy(5))
    // AddOption("DB Test", () => {
    //     executeDatabaseQuery("SELECT * FROM testUsers").then((result) => {
    //         console.log(result)
    //     })
        
    // })
    // AddOption("Look at note", lookAtNote)
    // AddOption("Try to open doors", tryOpenDrawers)
    // AddOption("Inspect Lock", inspectLock)
    displayRoomDescription();
    SetBackgroundImage("url('DDSProject/Assets/jonah.room.webp')")
    SetRoomName("Corridor")
}


