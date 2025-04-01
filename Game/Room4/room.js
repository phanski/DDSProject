/*
* Boilerplate code 
*/
let GameState = {
    PlayerEnergy: 10,
    PlayerTimeSeconds: 0
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
 * Loads player data from session storage to sync time and energy.
 * TODO: If sessions storage doesn't exist redirect to landing page. -
 * TODO: - Only allow beginning from landing page to ensure data is loaded from database before starting
 */
function LoadPlayerData() {
    // TODO
}

/**
 * Saves player data to session storage and asynchronously to database
 */
function SavePlayerData() {
    // TODO 
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

    Options.appendChild(NewOption)
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
    let timeSeconds = GameState.PlayerTimeSeconds % 60
    let timeMinutes = Math.floor(GameState.PlayerTimeSeconds / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
    TimeDisplay.textContent = TimerValue
}

/**
 * Get's current stored player energy and updates info bar
 */
function UpdateEnergyDisplay() {
    let EnergyDisplay = document.getElementById("PlayerEnergy")
    EnergyDisplay.textContent = GameState.PlayerEnergy
}

/**
 * Removes energy from player, ensuring it doesn't go negative and fails game if energy drops to 0
 * @param {integer} amount 
 * @returns False if amount is greater than current player energy. True otherwise
 */
function RemoveEnergy(amount) {
    if (amount > GameState.PlayerEnergy) return false

    GameState.PlayerEnergy -= amount

    if (GameState.PlayerEnergy === 0) {
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
    if (GameState.PlayerEnergy + amount > 100) return false

    GameState.PlayerEnergy += amount

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

    SavePlayerData()

    window.location.href = `/Game/Room${roomNumber}/room.html`
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
        // TODO: Restart game from start (clear session storage)
    })

    let ReturnHomeButton = document.getElementById("ReturnHomeButton")

    ReturnHomeButton.addEventListener('click', () => {
        // TODO: Ensure game state is cleared
        
        window.location.href = "/WEBSITE/website.html"
    })

    clearInterval(TimerInterval)
}

/**
 * Pauses the timer and displays a pause menu
 */
function PauseGame() {
    let GameWindow = document.getElementById("GameWindow")

    const PauseMenuPopup = '<div id="Overlay"><div id="OverlayMessage"><h1>Game Paused</h1><h2>Current Time : <span id="PauseScreenTime"></span></h2><div style="display: flex; justify-content: space-around; max-width: 500px; width: 100%;"><button class="OverlayButton" id="ResumeButton">Resume</button><button class="OverlayButton" id="ReturnHomeButton">Return to Home</button></div></div></div>'
    GameWindow.insertAdjacentHTML('beforeend', PauseMenuPopup)

    let resumeButton = document.getElementById('ResumeButton')
    resumeButton.addEventListener('click', ResumeGame)

    let pauseTimeDisplay = document.getElementById('PauseScreenTime')
    let timeSeconds = GameState.PlayerTimeSeconds % 60
    let timeMinutes = Math.floor(GameState.PlayerTimeSeconds / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
    let ReturnHomeButton = document.getElementById("ReturnHomeButton")
    ReturnHomeButton.addEventListener('click', () => {
        // TODO: Ensure game state is saved
        
        window.location.href = "/WEBSITE/website.html"
    })
    
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
        GameState.PlayerTimeSeconds += 1
        UpdateTimerDisplay()

        const FiveMinutes = 5 * 60

        if (GameState.PlayerTimeSeconds > FiveMinutes) {
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

    LoadPlayerData()
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

/* 
* Boilerplate code end
*/

//EDIT BELOW HERE

// temporary function - made this because ShowMessage("abc"); setTimeout(ShowMessage("xyz"), 1000) didnt work and was too lazy to fix it
function Delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
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








// async function OpenInventory() {
//     try {
//         let GameWindow = document.getElementById("GameWindow")
//         let inventoryPartNames = []; // = between let and inventoryPartNames??
//         let inventoryPartIDs = []; 

//         let response = await fetch(DatabaseConnectionData.url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             body: new URLSearchParams({
//                 hostname: DatabaseConnectionData.hostname,
//                 username: DatabaseConnectionData.username,
//                 password: DatabaseConnectionData.password,
//                 database: DatabaseConnectionData.database,
//                 query: `SELECT i.Name, i.ItemID FROM InventoryPart ip JOIN Item i ON ip.ItemID = i.ItemID WHERE ip.SaveID = 1` // // change to saveid when login finished
//             })
//         })
//         const data = await response.json();
//         for (let i = 0; i < data.data.length; i++) {
            
//             inventoryPartNames.push(data.data[i].Name);
//             inventoryPartIDs.push(data.data[i].ItemID);
            
        
//         }
//         console.log(inventoryPartIDs)

//         const InventoryPopUp = 
//     `<div id="Overlay">
//         <div id="OverlayMessage">
//             <h1>Inventory</h1>
//             <div id="InventoryGrid">
//                 ${generateInventoryGrid(inventoryPartNames, inventoryPartIDs)}
//             </div>
//             <div style="display: flex; justify-content: space-around; max-width: 500px; width: 100%;">
//                 <button class="OverlayButton" id="ExitInventory">Resume</button>
//             </div>
//         </div>
//     </div>`
//         GameWindow.insertAdjacentHTML('beforeend', InventoryPopUp)
        
//         let exitInv = document.getElementById('ExitInventory')
//         exitInv.addEventListener('click', ExitInventory)
//         // return InventoryPopUp;
//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// }

// function ExitInventory() {
//     let GameWindow = document.getElementById("GameWindow")
//     let Overlay = GameWindow.lastChild
    
//     GameWindow.removeChild(Overlay)
// }


// //________________________________________________________________________________________________________________________________________________________________________

// /**
//  * Generates the HTML for the inventory grid
//  * @param {Array} inventory - Array of item names
//  */
// function generateInventoryGrid(inventory, ids) {
//     const gridSize = 16; // 4x4 grid
//     let gridHTML = `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 400px; height: 400px; margin: 0 auto; border: 2px solid #ccc; padding: 10px;">`;
    
//     for (let i = 0; i < gridSize; i++) {
//         const item = inventory[i] || null;
//         const id = ids[i] || null; // get the id of the item

//         //change "i" to item id 

//         gridHTML += ` 
//             <div id=${item} class="item" onclick="itemAction(${id})">
//                 ${item ? `<span style="color: #AAAAAA; text-align: center;">${item}</span>` : ''}
//             </div>
//         `;
//     }
    
//     gridHTML += '</div>';
//     return gridHTML;
// }



// function itemAction(id) {
//     ExitInventory();
//     //TO DO: query the database for the function of the item using the item name - can be a function that exists e.g. when EnergyPack is pressed, its function field has AddEnergy(5) in it, so AddEnergy(5) is called, simultaneously EnergyPack is removed from the inventory
//     if (id==1||id==2||id==3) { // id of energy pack
//         AddEnergy(5);
//         executeDatabaseQuery(`DELETE FROM InventoryPart WHERE ItemID = ${id} AND SaveID = 1`) // sql only required for consumable items - change hardcoded to saveid when login finished
//         // executeDatabaseQuery(`DELETE FROM InventoryPart WHERE ItemID = ${id} AND ${saveID} = 1`)
//         // SavePlayerData()
//         DisplayMessageAfterDelay("You have gained 5 energy from the Energy Pack!");
        
        
    
        
//     }

//     // to add more items, just add an else if statement with the id of the item and the function you want to call when it is clicked.

// }

// /**
//  * Checks if item is in inventory
//  * @param {integer} id - ID of the item to check
//  * @returns {boolean} present - True if item is present, false otherwise
//  */
// function checkInventory(id) {
//     executeDatabaseQuery(`SELECT * FROM InventoryPart WHERE ItemID = ${id} AND SaveID = 1`).then((result) => { // change saveid
//         if (result.data.length > 0) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     ).catch((error) => {
//         console.error('Error checking inventory:', error);
//         return false; // Error occurred, assume item is not present
//     });
// }
//________________________________________________________________________________________________________________________________________________________________________

/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    

    SetRoomName("Small, Dark Room");
    ShowMessage("You enter a small, dark room. There is a table in the centre with a note on it, and a door opposite to you.");

    AddOption("Read the note", () => {
        ShowMessage('It reads "LRRR"');
        // HideOptions();
        DisplayMessageAfterDelay ("You enter a small, dark room. There is a table in the centre with a note on it, and a door opposite to you.");
        
    });

    // AddOption("Pick up the note", () => {
    //     ShowMessage('You pick up the note and put it in your inventory.');
    //     executeDatabaseQuery(`INSERT INTO InventoryPart (ItemID, SaveID) VALUES (4, 1)`); // change saveid when login finished
    //     // HideOptions();
    //     DisplayMessageAfterDelay ("You enter a small, dark room. There is a table in the centre, and a door opposite to you.");

    // })

    AddOption("Go through the door", () => {
        // HideOptions();
        // setTimeout(ShowOptions, 2000);
        SetRoomName("Corridor #1");
        ShowMessage('You find yourself in a narrow corridor which extends to your left and right.');
        ClearOptions();

        

        // correct #1
        AddOption("Go left", () => {
            SetRoomName("Corridor #2");
            ShowMessage('You now find yourself in another narrow corridor which extends to your left and right.');
            ClearOptions();

            // incorrect #2
            AddOption("Go left", () => {
                
                
                ShowMessage('You hit a dead end. You turn back.');
                


                // // if energy pack is in inventory show this message
                // ShowMessage('You hit a dead end. You turn back.');
                
                // HideOptions();
                
                DisplayMessageAfterDelay ('You are back in the second narrow corridor which, surprisingly, still extends to your left and right.');
        });

            // correct #2
            AddOption("Go right", () => {
                SetRoomName("Corridor #3");
                // ShowMessage("As you move along the corridor, you see a faint glow emanating through the next opening.");
                ShowMessage('You find yourself in yet another narrow corridor which extends to your left and right.');
                
                ClearOptions();

                // incorrect #3
                AddOption("Go left", () => {
                    ShowMessage('You hit a dead end. You turn back.');
                    // HideOptions();
                    DisplayMessageAfterDelay ('You retrace your steps back to the third narrow corridor, which still extends to your left and right.');
                });

                // correct #3
                AddOption("Go right", () => {
                    SetRoomName("Corridor #4");
                    ShowMessage('You find yourself in yet another narrow corridor which extends to your left and right.');
                    ClearOptions();
    
                    // incorrect #4
                    AddOption("Go left", () => {
                        ShowMessage('You hit a dead end. You turn back.');
                        // HideOptions();
                        DisplayMessageAfterDelay ('You retrace your steps back to the fourth narrow corridor, which still extends to your left and right.');
                    });
    
                    // correct #4
                    AddOption("Go right", () => {
                        SetRoomName("End?");
                        ShowMessage('Congratulations! You made it to the end. You see a door in front of you.');
                        ClearOptions();
                        AddOption("Go through door", () => {
                            // change to whatever room is next
                            TransitionToRoom(2);

                            // // Cleared to ensure timer doesn't tick while user is waiting for room to load
                            // clearInterval(TimerInterval)

                            // SavePlayerData()

                            // window.location.href = `/Game/Room${roomNumber}/room.html`
                            // // window.location.href = `/Game/End Screen Credits/win.html`
                        });
                    });
                });
            });
        });

        // incorrect #1
        AddOption("Go right", () => {
            ShowMessage('You get caught in a trap and debris falls from the ceiling. You lose 5 energy healing your wounds.');
            RemoveEnergy(5);
            // HideOptions();
            DisplayMessageAfterDelay ('Retracing your steps, you are back in the narrow corridor which still extends to your left and right.');
        });
    });

    

    
    
}
