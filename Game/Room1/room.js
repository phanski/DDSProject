// Example option actions

function ShowMessage(messageText) {
    let message = document.getElementById("Message")
    message.style.display = "block"
    message.children[0].textContent = messageText
}

function HideMessage() {
    let message = document.getElementById("Message")

    message.style.display = "none"
}

function ShowObject(imageURL) {
    let objectPopup = document.getElementById("FocusedObject")
    objectPopup.style.display = "block"
    objectPopup.children[0].src = imageURL
}

function HideObject() {
    let objectPopup = document.getElementById("FocusedObject")
    objectPopup.style.display = "none"
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
 * Loads current player state from local storage and syncs up room
 */
function LoadPlayerState() {

}

window.addEventListener('load', StartRoom)

//EDIT BELOW HERE


/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    LoadPlayerState()
    
    //EDIT BELOW HERE
    AddOption("Show Messsage", () => ShowMessage('New Option'))
    AddOption("Hide Message", HideMessage)
    AddOption("Show Object", () => ShowObject(`https://imgs.search.brave.com/Uv7PjPwToss4YP4krNPTTauC8y1Iq7BXFAWSoknkpAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/ODE0LzU2Ny9zbWFs/bC9yb2xsLW9mLXll/bGxvdy1zY290Y2gt/dGFwZS0zZC1oaWdo/LXF1YWxpdHktcGhv/dG8tcG5nLnBuZw`))
    AddOption("Hide Object", () => HideObject())
    AddOption("Clear Options", () => ClearOptions("You may not make an action now"))
    SetBackgroundImage("/Assets/scaryimageREMOVE--------------------------.webp")
}

