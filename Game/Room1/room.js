/*
* Boilerplate code 
*/

let GameState = {
    energy: 10,
    time: 0,
    userName: sessionStorage.getItem('LoggedInUser'), 
    roomID: 1,
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
 * Records the user's runtime for the current room and stores it in the database
 * @param {function} callback - Function to execute after data is stored
 */
function recordRoomCompletion(callback) {
    // Get current username from session storage
    const username = sessionStorage.getItem('LoggedInUser') || 'unknown_user';
    
    // Get the current runtime in seconds
    const runtimeSeconds = GameState.PlayerTimeSeconds;
    
    // Get current room number from the URL
    const currentUrl = window.location.href;
    const roomMatch = currentUrl.match(/Room(\d+)/);
    const roomNumber = roomMatch ? roomMatch[1] : '0';
    
    // Create timestamp
    const timestamp = new Date().getTime()
    
    // Create SQL query to insert the data
    const sqlQuery = `INSERT INTO room_completions (username, room_number, runtime_seconds, completion_time) 
                     VALUES ('${username}', ${roomNumber}, ${runtimeSeconds}, '${timestamp}')`;
    
    // Execute the query
    executeDatabaseQuery(sqlQuery)
        .then(result => {
            console.log('Room completion recorded successfully');
            if (callback && typeof callback === 'function') {
                callback(result);
            }
        })
        .catch(error => {
            console.error('Failed to record room completion:', error);
            if (callback && typeof callback === 'function') {
                callback(null, error);
            }
        });
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
    NewOption.addEventListener("click", OptionAction)
    
    NewOption.style.display="none";

    Options.appendChild(NewOption)
    setTimeout(()=>{
        loadSetting();
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
async function TransitionToRoom(roomNumber) {
    // Cleared to ensure timer doesn't tick while user is waiting for room to load
    clearInterval(TimerInterval)

    sessionStorage.setItem('GameState', JSON.stringify(GameState))
    saveGame(GameState)
    await recordRoomCompletion()

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

    const PauseMenuPopup = '<div id="Overlay"><div id="OverlayMessage"><h1>Game Paused</h1><h2>Current Time : <span id="PauseScreenTime"></span></h2><di style="display: flex; justify-content: space-around; width: 100%;"><button class="OverlayButton" id="ResumeButton">Resume</button><button class="OverlayButton" id="ReturnHomeButton">Return to Home</button><button class="OverlayButton" id="SaveButton">Save</button></div></div></div>'
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
    document.getElementById("InventoryButton").addEventListener('click', OpenInventory)
    let loadedGameState = JSON.parse(sessionStorage.getItem('GameState'))
    if (loadedGameState == undefined || loadedGameState.userName == undefined) {
        window.location.href = "../../WEBSITE/loginScreen.html"
    }
    
    GameState.energy = loadedGameState.energy
    GameState.time = loadedGameState.time
    GameState.inventory = loadedGameState.inventory
    sessionStorage.setItem('GameState', JSON.stringify(GameState))
    saveGame(GameState)

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


function Delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

/**
 * Disables options while message is displayed - name tbd
 * @param {string} messageText 
 */
function DisplayMessageAfterDelay (messageText) {
    DisableOptions();
    Delay(2000).then(() => {
        ShowMessage(messageText);
        EnableOptions();
    });  
    
}

function DisableOptions() {
    let Options = document.getElementById("UserOptions");
    for (let i = 0; i < Options.children.length; i++) {
        Options.children[i].style.pointerEvents = "none";
    }
}



function EnableOptions() {
    let Options = document.getElementById("UserOptions");
    for (let i = 0; i < Options.children.length; i++) {
        Options.children[i].style.pointerEvents = "auto";
    }
}


function FirstBookChoice() {
    ClearOptions()
    ShowMessage("There are 3 books and the ground and 3 pages ripped out")
    
    let focusedObjectDiv = document.getElementById("FocusedObject")
    let pageImage = document.createElement('img')
    
    pageImage.style = "height: 600px"

    AddOption("Read first page", () => {
        ClearOptions()                
        pageImage.src = "../../Assets/Chapter3.png"
        focusedObjectDiv.replaceChildren(pageImage)

        AddOption("Return to other pages", () => {
            focusedObjectDiv.replaceChildren([])
            FirstBookChoice()
        })
    })

    AddOption("Read second page", () => {
        ClearOptions()
        pageImage.src = "../../Assets/Chapter1.png"
        focusedObjectDiv.replaceChildren(pageImage)

        AddOption("Return to other pages", () => {
            focusedObjectDiv.replaceChildren([])
            FirstBookChoice()
        })
    })

    AddOption("Read third page", () => {
        ClearOptions()
        pageImage.src = "../../Assets/Chapter2.png"
        focusedObjectDiv.replaceChildren(pageImage)

        AddOption("Return to other pages", () => {
            focusedObjectDiv.replaceChildren([])
            FirstBookChoice()
        })
    })
    AddOption("Return to locked box", () => {
        focusedObjectDiv.replaceChildren([])
        BoxChoice()
    })
}

function SecondBookChoice () {
    ClearOptions()
    ShowMessage("There are 3 books and the ground and 3 pages ripped out")
    let focusedObjectDiv = document.getElementById("FocusedObject")
    let pageImage = document.createElement('img')
    pageImage.style = "height: 600px"
    

    AddOption("Read first page", () => {
        ClearOptions()                
        pageImage.src = "../../Assets/Chapter3.png"
        focusedObjectDiv.replaceChildren(pageImage)

        AddOption("Return to other pages", () => {
            focusedObjectDiv.replaceChildren([])
            SecondBookChoice()
        })
    })

    AddOption("Read second page", () => {
        ClearOptions()
        pageImage.src = "../../Assets/Chapter1.png"
        focusedObjectDiv.replaceChildren(pageImage)

        AddOption("Return to other pages", () => {
            focusedObjectDiv.replaceChildren([])
            SecondBookChoice()
        })
    })

    AddOption("Read third page", () => {
        ClearOptions()
        pageImage.src = "../../Assets/Chapter2.png"
        focusedObjectDiv.replaceChildren(pageImage)

        AddOption("Return to other pages", () => {
            focusedObjectDiv.replaceChildren([])
            SecondBookChoice()
        })
    })
    AddOption("Return to note", () => {
        focusedObjectDiv.replaceChildren([])
        NoteChoice()
    })


}


function BoxChoice() {
    ClearOptions()

    ShowMessage("Are you ready to unlock the box?")

    AddOption("Return to books", FirstBookChoice)

    AddOption("Enter Code", () => {
        const CorrectCode = "6129"

        ClearOptions()
        HideMessage()
        const focusedObjectDiv = document.getElementById("FocusedObject")

        let codeInput = document.createElement('input')
        codeInput.id = "CodeInput"
        focusedObjectDiv.appendChild(codeInput)
        
        codeInput.focus()
        AddOption("Confirm", () => {
            let inputValue = codeInput.value
            if (inputValue !== CorrectCode) {
                ShowMessage("Incorrect Code")
                return  
            }
            ShowMessage("The box opens with a loud creak. Inside you find an unfinished note seemingly written in a hurry")
            ClearOptions()
            AddOption("Read note", () => {
                let noteImage = document.createElement('img')
                noteImage.src = "../../Assets/note.png"
                noteImage.style = "height: 100%"
                focusedObjectDiv.appendChild(noteImage)
        

                
                ShowMessage("The last letters appear to be smudged")
                ClearOptions()

                AddOption("Return to books", () => {
                    focusedObjectDiv.replaceChildren([])
                    SecondBookChoice()
                })
            })
        
            focusedObjectDiv.replaceChildren([])
        })
        AddOption("Return to books", FirstBookChoice)
    })
}


function NoteChoice() {
    const CorrectLetters = "run"
    ClearOptions()

    ShowMessage("What are the last three letters?")
    AddOption("Fill in the blanks", () => {
        ClearOptions()
        const focusedObjectDiv = document.getElementById("FocusedObject")
        
        let noteImage = document.createElement('img')
        noteImage.src = "../../Assets/note.png"
        noteImage.style = "height: 100%"
        focusedObjectDiv.appendChild(noteImage)
        focusedObjectDiv.append(document.createElement('br'))

        let WordInput = document.createElement('input')
        WordInput.id = "WordInput"
        focusedObjectDiv.appendChild(WordInput)
        WordInput.focus()

        AddOption("Confirm", () => {
            let inputValue = WordInput.value
            if (inputValue !== CorrectLetters) {
                ShowMessage("Hmm, that doesn't make sense")
                return
                
            }
            ClearOptions()
            HideMessage()
            
            AddOption("Run", () => {
                TransitionToRoom(4)
            })
        })

    })
}

/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    SetBackgroundImage("../../Assets/StudyBackground.webp")
    SetRoomName("Study")

    ShowMessage("You enter the study and find it in complete disarray. Books are strewn across the floor along with torn out pages.")
    AddOption("Investigate Further", () => {
        ClearOptions()

        ShowMessage("The desk is in a similar state to the rest of the room, however, you find a locked box with a 4 digit combination lock on top of the desk.")
        AddOption("Search room", () => {
            ClearOptions()
            ShowMessage("You turn around to go search through the pile of books. As you walk away from the desk you stumble over a crooked floorboard.")

            AddOption("Search books", FirstBookChoice)

            AddOption("Find out what you tripped on", () => {
                // TODO: Bonus item when inventory is added
            })
        })
    })
}

