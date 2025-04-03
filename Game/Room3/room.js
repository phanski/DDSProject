/*
* Boilerplate code 
*/

let GameState = {
    energy: 10,
    time: 0,
    userName: sessionStorage.getItem('LoggedInUser'), 
    roomID: 3,
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

  let loadedGameState = JSON.parse(sessionStorage.getItem('GameState'))
  if (loadedGameState == undefined || loadedGameState.userName == undefined) {
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
    GameView.style.gridTemplateRows = "auto 1fr"
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

/**
 * Removes options bar from user and message popup slot to allow for more room for UI
 */
function HideOptionsAndMessage() {
    let OptionsBar = document.getElementById("UserOptions")
    OptionsBar.parentElement.removeChild(OptionsBar)

    let GameWindow = document.getElementById("GameWindow")
    GameWindow.style.gridTemplateRows = "100%"

    let GameView = document.getElementById("GameView")
    GameView.style.gridTemplateRows = "auto 1fr auto"
}

/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    // Elements for Phases 1 & 2
    const buttons = document.querySelectorAll("#buttons button");
    const feedback = document.getElementById("puzzleFeedback");
    const submitBtn = document.getElementById("submitPuzzle");
    const dialSection = document.getElementById("dial-section");
    const dial1 = document.getElementById("dial1");
    const dial2 = document.getElementById("dial2");

    // Elements for Phase 3 (keypad)
    const keypadSection = document.getElementById("keypad-section");
    const keypadDisplay = document.getElementById("keypad-display");
    const keypadButtons = document.querySelectorAll("#keypad-buttons button[data-digit]");
    const keypadClear = document.getElementById("keypad-clear");

    // Track puzzle phases: 1 = button sequence, 2 = dial adjustment, 3 = keypad entry
    let phase = 1;
    let sequenceInput = "";
    let keypadInput = "";
    const correctSequence = "BADC";    // Phase 1 correct sequence
    const forbiddenPattern = "BAAD";    // Forbidden code
    const correctDial1 = 3;              // Phase 2 dial values
    const correctDial2 = 7;
    const correctKeypad = "3145";        // Phase 3 correct numeric code

    // Utility: count matching characters in sequence
    function countSequenceMatches(input, correct) {
      let matches = 0;
      for (let i = 0; i < Math.min(input.length, correct.length); i++) {
        if (input[i] === correct[i]) matches++;
      }
      return matches;
    }

    // Utility: themed hint for button sequence (Phase 1)
    function getSequenceHint(input) {
      const matches = countSequenceMatches(input, correctSequence);
      if (matches === 0) return "The symbols remain a jumbled enigma.";
      if (matches < correctSequence.length) return `You have ${matches} symbol(s) resonating with the hidden code.`;
      return "";
    }

    // Utility: themed feedback for dial values (Phase 2)
    function getDialFeedback(current, correct, dialName) {
      const diff = Math.abs(current - correct);
      if (diff === 0) return `The ${dialName} aligns perfectly.`;
      if (diff === 1) return `The ${dialName} shimmers almost in harmony.`;
      if (current < correct) return `The ${dialName} seems too low, yearning to rise.`;
      return `The ${dialName} is set too high, lost in the void.`;
    }

    // Phase 1: Button clicks (active only in Phase 1)
    buttons.forEach(button => {
      button.addEventListener("click", function() {
        if (phase === 1) {
          const value = button.getAttribute("data-value");
          sequenceInput += value;
          feedback.textContent = "Current Sequence: " + sequenceInput;
        }
      });
    });

    // Phase 3: Keypad button clicks
    keypadButtons.forEach(btn => {
      btn.addEventListener("click", function() {
        if (phase === 3) {
          const digit = btn.getAttribute("data-digit");
          keypadInput += digit;
          keypadDisplay.textContent = "Current Code: " + keypadInput;
        }
      });
    });
    keypadClear.addEventListener("click", function() {
      if (phase === 3) {
        keypadInput = "";
        keypadDisplay.textContent = "Current Code: ";
      }
    });

    // Submit button (handles actions for all phases)
    submitBtn.addEventListener("click", function() {
      if (phase === 1) {
        // Phase 1: Process button sequence
        if (sequenceInput === forbiddenPattern) {
          feedback.textContent = "A chilling wind howls... You have invoked the forbidden sequence 'BAAD'. The manor condemns you. You wake up concussed with 50 energy removed.";
          RemoveEnergy(50);
          return;
        }
        if (sequenceInput === correctSequence) {
          feedback.textContent = "The hidden symbols resonate... The control panel reveals the secret dials!";
          dialSection.style.display = "block";
          document.getElementById("buttons").style.display = "none";
          phase = 2;
          sequenceInput = "";
          // Update clue text for Phase 2 (hinting at digit 1)
          document.getElementById("clueText").textContent = "A SOLITARY beacon in the gloom beckons. Adjust the dials to their proper positions.";
        } else {
          const hint = getSequenceHint(sequenceInput);
          feedback.textContent = `The panel murmurs: "${hint}" Try again.`;
          sequenceInput = "";
        }
      } else if (phase === 2) {
        // Phase 2: Process dial values
        const currentDial1 = parseInt(dial1.value, 10);
        const currentDial2 = parseInt(dial2.value, 10);
        if (currentDial1 === correctDial1 && currentDial2 === correctDial2) {
          feedback.textContent = "The mechanisms click... A hidden compartment opens, revealing a numeric keypad!";
          dialSection.style.display = "none";
          keypadSection.style.display = "block";
          phase = 3;
          // Update clue text for Phase 3 with the cryptic passage
          keypadInput = "";
          keypadDisplay.textContent = "Current Code: ";
        } else {
          const dial1Feedback = getDialFeedback(currentDial1, correctDial1, "first dial");
          const dial2Feedback = getDialFeedback(currentDial2, correctDial2, "second dial");
          feedback.textContent = `The dials whisper: "${dial1Feedback} ${dial2Feedback}" Adjust them carefully.`;
        }
      } else if (phase === 3) {
        // Phase 3: Process keypad input
        if (keypadInput === correctKeypad) {
          feedback.textContent = "The final mechanism hums with ancient power. The secret door slowly opens, revealing mysteries beyond...";
          AddOption("Leave Room",TransitionToRoom(2));
        } else {
          feedback.textContent = `The keypad remains unyielding. The code "${keypadInput}" is not correct. Try again.`;
          keypadInput = "";
          keypadDisplay.textContent = "Current Code: ";
        }
      }
    });
    

    SetBackgroundImage("../../Assets/scaryimageREMOVE--------------------------.webp")
    HideOptionsAndMessage()
    SetRoomName("Parlor Room")
}

