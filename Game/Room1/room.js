/*
* Boilerplate code 
*/
let PlayerEnergy = 10
let PlayerTimeSeconds = 0
let TimerInterval = undefined


/**
 * Loads player data from session storage to sync time and energy
 */
function LoadPlayerData() {
    // TODO
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
 * @param {string} emptyMessage Optional Message to show instead of options
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
    let timeSeconds = PlayerTimeSeconds % 60
    let timeMinutes = Math.floor(PlayerTimeSeconds / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
    TimeDisplay.textContent = TimerValue
}

/**
 * Get's current stored player energy and updates info bar
 */
function UpdateEnergyDisplay() {
    let EnergyDisplay = document.getElementById("PlayerEnergy")
    EnergyDisplay.textContent = PlayerEnergy
}

/**
 * Removes energy from player, ensuring it doesn't go negative and fails game if energy drops to 0
 * @param {integer} amount 
 * @returns False if amount is greater than current player energy. True otherwise
 */
function RemoveEnergy(amount) {
    if (amount > PlayerEnergy) return false

    PlayerEnergy -= amount

    if (PlayerEnergy === 0) {
        // TODO: Fail State
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
    if (PlayerEnergy + amount > 100) return false

    PlayerEnergy += amount

    UpdateEnergyDisplay()
    return true
}

/**
 * Transitions to another room safely, ensuring cleanup of any boilerplate functions
 * @param {integer} roomNumber 
 */
function TransitionToRoom(roomNumber) {
    // Cleared to ensure timer doesn't tick while user is waiting for room to load
    clearInterval(TimerInterval)
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
 * Syncs room with current player data and starts timer
 */
function InitRoom() {
    LoadPlayerData()
    
    UpdateEnergyDisplay()

    //TODO: sync current run time
    
    TimerInterval = setInterval(() => {
        PlayerTimeSeconds += 1
        UpdateTimerDisplay()
    }, 1000)

    StartRoom()
}

window.addEventListener('load', InitRoom)

/* 
* Boilerplate code end
*/

//EDIT BELOW HERE

/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    
    
    // AddOption("Show Messsage", () => ShowMessage('New Option'))
    // AddOption("Hide Message", HideMessage)
    // AddOption("Show Object", () => ShowObject(`https://imgs.search.brave.com/Uv7PjPwToss4YP4krNPTTauC8y1Iq7BXFAWSoknkpAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/ODE0LzU2Ny9zbWFs/bC9yb2xsLW9mLXll/bGxvdy1zY290Y2gt/dGFwZS0zZC1oaWdo/LXF1YWxpdHktcGhv/dG8tcG5nLnBuZw`))
    // AddOption("Hide Object", () => HideObject())
    // AddOption("Clear Options", () => ClearOptions("You may not make an action now"))
    // AddOption("Clear Options", () => ClearOptions())s



    AddOption("Add Energy", () => AddEnergy(5))
    AddOption("Remove Energy", () => RemoveEnergy(5))
    // AddOption("Change Room", () => TransitionToRoom(3))
    SetBackgroundImage("/Assets/scaryimageREMOVE--------------------------.webp")
    SetRoomName("Living Room")
}

