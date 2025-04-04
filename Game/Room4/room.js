/*
* Boilerplate code 
*/

let GameState = {
    energy: 10,
    time: 0,
    userName: sessionStorage.getItem('LoggedInUser'), 
    roomID: 4,
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
    

    Options.appendChild(NewOption);
    loadSetting();

    setTimeout(()=>{
        NewOption.style.display="block";
    },68.99);
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
    recordRoomCompletion()

    window.location.href = `../Room${roomNumber}/room.html`
}

/**
 * Fails the player for their current run
 * @param {integer} reason 1 - Ran out of time | 2 - Ran out of energy
 */
async function FailGame(reason) {
    await executeDatabaseQuery(`DELETE FROM InventoryPart WHERE SaveID = (SELECT SaveID FROM SaveFile WHERE Username = "${sessionStorage.getItem('LoggedInUser')}")`)
    await executeDatabaseQuery(`DELETE FROM SaveFile WHERE Username = "${sessionStorage.getItem('LoggedInUser')}"`)
    window.removeEventListener('beforeunload', onPageLeave)

    sessionStorage.removeItem('GameState')

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
        sessionStorage.setItem("GameState", JSON.stringify({
            energy: 100,
            time: 0,
            userName: sessionStorage.getItem('LoggedInUser'), 
            roomID: 5,
            inventory: []
        }))
        window.location.href = "../Room5/room.html"
    })

    let ReturnHomeButton = document.getElementById("ReturnHomeButton")
    ReturnHomeButton.addEventListener('click', async () => {
        window.removeEventListener('beforeunload', onPageLeave)
        await saveGame(GameState)
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
    document.getElementById("InventoryButton").addEventListener('click', OpenInventory)

    let loadedGameState = JSON.parse(sessionStorage.getItem('GameState'))
    if (sessionStorage.getItem('GameState') == undefined || loadedGameState.userName == undefined) {
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

/**
 * Records the user's runtime for the current room and stores it in the database
 * @param {function} callback - Function to execute after data is stored
 */
async function recordRoomCompletion(callback) {
    // Get current username from session storage
    const username = sessionStorage.getItem('LoggedInUser') || 'unknown_user';
    
    // Get the current runtime in seconds
    const runtimeSeconds = GameState.time;
    
    // Get current room number from the URL
    const currentUrl = window.location.href;
    const roomMatch = currentUrl.match(/Room(\d+)/);
    const roomNumber = roomMatch ? roomMatch[1] : '0';
    
    // Create timestamp
    const timestamp = new Date().getTime()
    
    // Create SQL query to insert the data
    const insertEntryQuery = `INSERT INTO room_completions (saveID, username, room_number, runtime_seconds, completion_time) 
                     VALUES ((SELECT SaveID FROM SaveFile WHERE Username = '${username}') ,'${username}', ${roomNumber}, ${runtimeSeconds}, '${timestamp}')`;
    
    // Execute the query
    await executeDatabaseQuery(insertEntryQuery)
    
    console.log('Room completion recorded successfully');
}

/* 
* Boilerplate code end
*/

//EDIT BELOW HERE


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

/**
 * Main Function which is called when room page is loaded
 */
// function StartRoom() {
    

//     SetRoomName("Small, Dark Room");
//     ShowMessage("You enter a small, dark room. There is a table in the centre with a note on it, and a door opposite to you.");

//     AddOption("Read the note", () => {
//         ShowMessage('It reads "LRRR"');
//         // HideOptions();
//         DisplayMessageAfterDelay ("You enter a small, dark room. There is a table in the centre with a note on it, and a door opposite to you.");
        
//     });

//     // AddOption("Pick up the note", () => {
//     //     ShowMessage('You pick up the note and put it in your inventory.');
//     //     executeDatabaseQuery(`INSERT INTO InventoryPart (ItemID, SaveID) VALUES (4, 1)`); // change saveid when login finished
//     //     // HideOptions();
//     //     DisplayMessageAfterDelay ("You enter a small, dark room. There is a table in the centre, and a door opposite to you.");

//     // })

//     AddOption("Go through the door", () => {
//         // HideOptions();
//         // setTimeout(ShowOptions, 2000);
//         SetRoomName("Corridor #1");
//         ShowMessage('You find yourself in a narrow corridor which extends to your left and right.');
//         ClearOptions();

        

//         // correct #1
//         AddOption("Go left", () => {
//             SetRoomName("Corridor #2");
//             ShowMessage('You now find yourself in another narrow corridor which extends to your left and right.');
//             ClearOptions();

//             // incorrect #2
//             AddOption("Go left", () => {
                
                
//                 ShowMessage('You hit a dead end. You turn back.');
                


//                 // // if energy pack is in inventory show this message
//                 // ShowMessage('You hit a dead end. You turn back.');
                
//                 // HideOptions();
                
//                 DisplayMessageAfterDelay ('You are back in the second narrow corridor which, surprisingly, still extends to your left and right.');
//         });

//             // correct #2
//             AddOption("Go right", () => {
//                 SetRoomName("Corridor #3");
//                 // ShowMessage("As you move along the corridor, you see a faint glow emanating through the next opening.");
//                 ShowMessage('You find yourself in yet another narrow corridor which extends to your left and right.');
                
//                 ClearOptions();

//                 // incorrect #3
//                 AddOption("Go left", () => {
//                     ShowMessage('You hit a dead end. You turn back.');
//                     // HideOptions();
//                     DisplayMessageAfterDelay ('You retrace your steps back to the third narrow corridor, which still extends to your left and right.');
//                 });

//                 // correct #3
//                 AddOption("Go right", () => {
//                     SetRoomName("Corridor #4");
//                     ShowMessage('You find yourself in yet another narrow corridor which extends to your left and right.');
//                     ClearOptions();
    
//                     // incorrect #4
//                     AddOption("Go left", () => {
//                         ShowMessage('You hit a dead end. You turn back.');
//                         // HideOptions();
//                         DisplayMessageAfterDelay ('You retrace your steps back to the fourth narrow corridor, which still extends to your left and right.');
//                     });
    
//                     // correct #4
//                     AddOption("Go right", () => {
//                         SetRoomName("End?");
//                         ShowMessage('Congratulations! You made it to the end. You see a door in front of you.');
//                         ClearOptions();
//                         AddOption("Go through door", () => {
//                             // change to whatever room is next
//                             saveGame(GameState)
//                             sessionStorage.setItem('GameState', null)
//                             window.location.href = `../../End Screen Credits/win.html`;
//                         });
//                     });
//                 });
//             });
//         });

//         // incorrect #1
//         AddOption("Go right", () => {
//             ShowMessage('You get caught in a trap and debris falls from the ceiling. You lose 5 energy healing your wounds.');
//             RemoveEnergy(5);
//             // HideOptions();
//             DisplayMessageAfterDelay ('Retracing your steps, you are back in the narrow corridor which still extends to your left and right.');
//         });
//     });   
// }

function StartRoom() {
    SetBackgroundImage("../../Assets/corridor.jpg")
    SetRoomName("Small, Dark Room");
    ShowMessage("You enter a small, dark room. There is a table in the centre with a note on it, and a door opposite to you.");

    AddOption("Read the note", () => {
        ShowMessage('It reads "LRRRRRRR"');
        DisplayMessageAfterDelay("You enter a small, dark room. There is a table in the centre with a note on it, and a door opposite to you.");
    });

    AddOption("Go through the door", () => {
        SetRoomName("Corridor #1");
        ShowMessage('You find yourself in a narrow corridor which extends to your left and right.');
        ClearOptions();

        // CORRECT PATH (Left, Right, Right, Right, ...)
        AddOption("Go left", () => {
            SetRoomName("Corridor #2");
            ShowMessage('You now find yourself in another narrow corridor which extends to your left and right.');
            ClearOptions();

            // INCORRECT (Left)
            AddOption("Go left", () => {
                ShowMessage('You hit a dead end. You turn back.');
                DisplayMessageAfterDelay('You are back in the second narrow corridor, which still extends to your left and right.');
            });

            // CORRECT (Right)
            AddOption("Go right", () => {
                SetRoomName("Corridor #3");
                ShowMessage('You find yourself in yet another narrow corridor which extends to your left and right.');
                ClearOptions();

                // INCORRECT (Left)
                AddOption("Go left", () => {
                    ShowMessage('You hit a dead end. You turn back.');
                    DisplayMessageAfterDelay('You retrace your steps back to the third corridor, which still extends left and right.');
                });

                // CORRECT (Right)
                AddOption("Go right", () => {
                    SetRoomName("Corridor #4");
                    ShowMessage('The corridor continues, stretching left and right before you.');
                    ClearOptions();

                    // INCORRECT (Left)
                    AddOption("Go left", () => {
                        ShowMessage('Dead end. You sigh and turn around.');
                        DisplayMessageAfterDelay('Back in corridor four, the path splits left and right.');
                    });

                    // CORRECT (Right)
                    AddOption("Go right", () => {
                        SetRoomName("Corridor #5");
                        ShowMessage('The maze continues. Left or right?');
                        ClearOptions();

                        // INCORRECT (Left)
                        AddOption("Go left", () => {
                            ShowMessage('Another dead end. This is getting tedious.');
                            DisplayMessageAfterDelay('Returning to corridor five, the options remain.');
                        });

                        // CORRECT (Right)
                        AddOption("Go right", () => {
                            SetRoomName("Corridor #6");
                            ShowMessage('Six corridors deep. Left or right?');
                            ClearOptions();
                        

                            // CORRECT (Right)
                            // if (checkInventory(1)) {
                            if (!(checkInventory(1))) {
                                console.log(`Inventory: ${GameState.inventory}`)
                                ShowMessage('As you move along the corridor, you see an energy pack on the floor.');
                                AddOption("Pick up energy pack", () => {

                                
                                    SetRoomName("Corridor #6");
                                    ClearOptions();
    
                                    ShowMessage('You pick up the pack and put it in your inventory. You continue moving along the corridor.');

                                    //
                                    //
                                    executeDatabaseQuery(`INSERT INTO InventoryPart (ItemID, SaveID) VALUES (1, (SELECT SaveID FROM SaveFile WHERE UserName = "${sessionStorage.getItem('LoggedInUser')}"))`).then((result) => {console.log(`Result: ${result}`)}); // change saveid when login finished
                                    
                                    // GameState.inventory.push(1);
                                    
                                    
                                    //
                                    
                                    DisplayMessageAfterDelay("Six corridors deep. Left or right?")

                                    // INCORRECT (Left)
                                    AddOption("Go left", () => {
                                        ShowMessage('Wall. Nothing but wall.');
                                        DisplayMessageAfterDelay('Back in the sixth corridor, the choice persists.');
                                    });

                                    // CORRECT (Right)
                                    AddOption("Go right", () => {
                                        SetRoomName("Corridor #7");
                                        ShowMessage('Seven corridors. Left or right?');
                                        ClearOptions();

                                        // INCORRECT (Left)
                                        AddOption("Go left", () => {
                                            ShowMessage('Nope, just another dead end.');
                                            DisplayMessageAfterDelay('Once more in corridor seven, the choice awaits.');
                                        });

                                        // CORRECT (Right)
                                        AddOption("Go right", () => {
                                            SetRoomName("Corridor #8");
                                            ShowMessage('Eighth corridor. One last choice: left or right?');
                                            ClearOptions();

                                            // INCORRECT (Left)
                                            AddOption("Go left", () => {
                                                ShowMessage('Dead end. Almost there...');
                                                DisplayMessageAfterDelay('Back in corridor eight, the final choice remains.');
                                            });

                                            // CORRECT (Right) - WIN
                                            AddOption("Go right", () => {
                                                SetRoomName("End?");
                                                ShowMessage('Congratulations! After eight corridors, you see a door.');
                                                ClearOptions();
                                                AddOption("Go through door", () => {
                                                    saveGame(GameState)
                                                    window.removeEventListener('beforeunload', onPageLeave)
                                                    sessionStorage.removeItem('GameState')
                                                    window.location.href = `../../End Screen Credits/win.html`;
                                                });
                                                
                                            });
                                        });
                                    });
                                    
    
                            })} else {
                                // INCORRECT (Left)
                                AddOption("Go left", () => {
                                    ShowMessage('Wall. Nothing but wall.');
                                    DisplayMessageAfterDelay('Back in the sixth corridor, the choice persists.');
                                });
    
                                // CORRECT (Right)
                                AddOption("Go right", () => {
                                    SetRoomName("Corridor #7");
                                    ShowMessage('Seven corridors. Left or right?');
                                    ClearOptions();
    
                                    // INCORRECT (Left)
                                    AddOption("Go left", () => {
                                        ShowMessage('Nope, just another dead end.');
                                        DisplayMessageAfterDelay('Once more in corridor seven, the choice awaits.');
                                    });
    
                                    // CORRECT (Right)
                                    AddOption("Go right", () => {
                                        SetRoomName("Corridor #8");
                                        ShowMessage('Eighth corridor. One last choice: left or right?');
                                        ClearOptions();
               
                                        // INCORRECT (Left)
                                        AddOption("Go left", () => {
                                            ShowMessage('Dead end. Almost there...');
                                            DisplayMessageAfterDelay('Back in corridor eight, the final choice remains.');
                                        });
    
                                        // CORRECT (Right) - WIN
                                        AddOption("Go right", () => {
                                            SetRoomName("End?");
                                            ShowMessage('Congratulations! After eight corridors, you see a door.');
                                            ClearOptions();
                                            AddOption("Go through door", async () => {
                                                await executeDatabaseQuery(`DELETE FROM InventoryPart WHERE SaveID = (SELECT SaveID FROM SaveFile WHERE Username = "${sessionStorage.getItem('LoggedInUser')}")`)
                                                await executeDatabaseQuery(`DELETE FROM SaveFile WHERE Username = "${sessionStorage.getItem('LoggedInUser')}"`)
                                                window.removeEventListener('beforeunload', onPageLeave)
                                                recordRoomCompletion()
    
                                                sessionStorage.removeItem('GameState')
                                                sessionStorage.setItem('Completiontime', GameState.time)
                                                window.location.href = `../../End Screen Credits/win.html`;
                                            });
                                            
                                        });
                                    });
                                });} 
                            
                            
                        });
                    });
                });
            });
        });

        // INCORRECT PATH (Right) - TRAP
        AddOption("Go right", () => {
            ShowMessage('You get caught in a trap and debris falls from the ceiling...');
            
            RemoveEnergy(GameState.energy);
            // DisplayMessageAfterDelay('Retracing your steps, you are back in the narrow corridor which still extends to your left and right.');
        });
    });
}
