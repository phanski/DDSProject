/*
* Boilerplate code 
*/

let GameState = {
    energy: 10,
    time: 0,
    userName: sessionStorage.getItem('LoggedInUser'), 
    roomID: 2,
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

    sessionStorage.setItem('GameState', GameState)

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

    const PauseMenuPopup = '<div id="Overlay"><div id="OverlayMessage"><h1>Game Paused</h1><h2>Current Time : <span id="PauseScreenTime"></span></h2><div style="display: flex; justify-content: space-around; max-width: 500px; width: 100%;"><button class="OverlayButton" id="ResumeButton">Resume</button><button class="OverlayButton" id="ReturnHomeButton">Return to Home</button><button class="OverlayButton" id="SaveButton">Save</button></div></div></div>'
    GameWindow.insertAdjacentHTML('beforeend', PauseMenuPopup)

    let resumeButton = document.getElementById('ResumeButton')
    resumeButton.addEventListener('click', ResumeGame)

    let pauseTimeDisplay = document.getElementById('PauseScreenTime')
    let timeSeconds = GameState.time % 60
    let timeMinutes = Math.floor(GameState.time / 60)

    let TimerValue = `${timeMinutes}:${("" + timeSeconds).padStart(2, "0")}`
    let ReturnHomeButton = document.getElementById("ReturnHomeButton")
    ReturnHomeButton.addEventListener('click', () => {
        // TODO: Ensure game state is saved
        
        window.location.href = "/WEBSITE/website.html"
    })
    
    let saveButton = document.getElementById('SaveButton')
    saveButton.addEventListener('click', () => createNewSave(GameState))


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

    GameState = sessionStorage.getItem('GameState')

    if (GameState == undefined || GameState.userName == undefined) {
        window.location.pathname = "/WEBSITE/login.html"
    }
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

var rows=3;
var columns=3;

var currTile;
var otherTile;

var tempOrder=["4","2","8","5","1","6","7","9","3"]; 

var correctOrder=["1","2","3","4","5","6","7","8","9"];

let RoomDescription = "You are in the living room. It is a cozy room with a fireplace and a large sofa. On a table in the midle of the room, you can see a small box";

window.onload = () => ShowMessage(RoomDescription);

function ShowObject(url,description){
    AddOption("Set box down", () => HideObject()),RemoveOption("Investigate the box"),RemoveOption("Reset Board");
    ClearObject();
    HideMessage(),ShowMessage("On a closer look, you can see the box has a puzzle on it.");
    let object=document.getElementById("FocusedObject");
    if (object.children.length==0){
        let child=document.createElement("img");
        child.class="ObjectContent";
        child.src=url;
        child.alt=description;
        child.style.width,child.style.height="100%";
        child.style.cursor="pointer";
        child.addEventListener("click",()=>{HideMessage(),showBoard();})
        object.append(child);
    }
    object.style.display="block";
}
function HideObject(){ 
    RemoveOption("Set box down");
    try{
        RemoveOption("Reset Board");
    }catch{
        console.log("");
    }
    HideMessage();
    AddOption("Investigate the box", () => ShowObject(`https://imgs.search.brave.com/Uv7PjPwToss4YP4krNPTTauC8y1Iq7BXFAWSoknkpAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/ODE0LzU2Ny9zbWFs/bC9yb2xsLW9mLXll/bGxvdy1zY290Y2gt/dGFwZS0zZC1oaWdo/LXF1YWxpdHktcGhv/dG8tcG5nLnBuZw`,"Alt text"))
    let object=document.getElementById("FocusedObject");
    object.style.display="none";
}

function showBoard(){
    ClearObject(); //Clears the object and resets the board
    AddOption("Reset Board",resetBoard);
    let imgOrder=tempOrder.slice();
    let board=document.createElement("div");

    board.id="Board";
    board.style.backgroundColor="lightbrown";
    board.style.width,board.style.height="100%";
    board.style.border="10px solid blue";
    board.style.display="flex";
    board.style.flexWrap="wrap";

    for (let r=0; r<rows; r++) {
        for(let c=0; c<columns; c++){

            //Creating the image tiles and adding them to the board

            let tile = document.createElement("img");
            tile.id=r.toString() + "-" +c.toString();
            tile.src = "../../Assets/"+imgOrder.shift() +".jpg";

            if (tile.src.includes("3.jpg")){
                tile.style.opacity="0";
            }

            tile.style.width="31.33%";
            tile.style.height="31.33%";
            tile.style.cursor="pointer";
            tile.style.border="1% solid brown";

            tile.setAttribute("alt",tile.id);

            tile.addEventListener("dragstart",dragStart); //click an image to drag
            tile.addEventListener("dragover",dragOver); //moving image around while clicked
            tile.addEventListener("dragenter",dragEnter); //dragging image onto another one
            tile.addEventListener("dragleave",dragLeave); //dragged image leaving onto another image
            tile.addEventListener("drop",dragDrop); //drag an image over another image, drop the image
            tile.addEventListener("dragend",dragEnd); //after drag drop, swap the two tiles

            document.getElementById("FocusedObject").append(tile);
        }
    }
    if (imgOrder.length==0){
        imgOrder=tempOrder.slice();
    }
}

function dragStart(){
    currTile=this;
}

function dragOver(e){
    e.preventDefault();
}
function dragEnter(e){
    e.preventDefault();
}
function dragLeave(){

}
function dragDrop(){
    otherTile = this;
}

function dragEnd(){
    if (!otherTile.src.includes("3.jpg")){ //3.jpg is the blank image that is not draggable and is used to swap with other images
        return;
    }
    //Checking if the images are adjacent to each other

    let currCoords = currTile.id.split("-");
    let row=parseInt(currCoords[0]);
    let column = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let otherRow = parseInt(otherCoords[0]);
    let otherColumn = parseInt(otherCoords[1]);

    let moveLeft = row === otherRow && otherColumn===column-1;
    let moveRight = row === otherRow && otherColumn===column+1;

    let moveUp = column === otherColumn && otherRow===row-1;
    let moveDown = column === otherColumn && otherRow===row+1;

    let isAdjacent = moveLeft || moveRight || moveUp ||moveDown;

    if (isAdjacent){
        //Swapping the images

        let currImg = currTile.src;
        let otherImg = otherTile.src;

        currTile.src=otherImg;
        currTile.style.opacity="0";
        
        otherTile.src=currImg;
        otherTile.style.opacity="1";
        
        //Checking if the images are in the correct order. If they are, the player wins and are returned to the room

        let currParts=currTile.src.split("/");
        let otherParts=otherTile.src.split("/");

        let currFile=currParts[currParts.length-1];
        let otherFile=otherParts[otherParts.length-1];

        let currNum=currFile.split(".")[0];
        let otherNum=otherFile.split(".")[0];

        currIndex=tempOrder.indexOf(currNum);
        otherIndex=tempOrder.indexOf(otherNum);
                
        let temp=tempOrder[otherIndex];

        tempOrder[otherIndex]=tempOrder[currIndex];

        tempOrder[currIndex]=temp;
        
        if (tempOrder.join("")==correctOrder.join("")){
            setTimeout(()=>{showReward()},1000);//Play Audio to indicate success
            
        }
    }
}

function resetBoard(){
    
    tempOrder=["4","2","8","5","1","6","7","9","3"];//Resets the order of the images to the original order
    imgOrder=tempOrder.slice();//Resets the images array to repopulate


    //Removes all tiles from the board
    for (let r=0; r<rows; r++) {
        for(let c=0; c<columns; c++){
            let tile = document.getElementById(r.toString()+"-"+c.toString());
            tile.remove();
        }  
    }
    RemoveOption("Reset Board");
    showBoard();
}

function showReward(){
    //Unfinished Function
    ClearObject();
    ShowObject(`https://imgs.search.brave.com/Uv7PjPwToss4YP4krNPTTauC8y1Iq7BXFAWSoknkpAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/ODE0LzU2Ny9zbWFs/bC9yb2xsLW9mLXll/bGxvdy1zY290Y2gt/dGFwZS0zZC1oaWdo/LXF1YWxpdHktcGhv/dG8tcG5nLnBuZw`,"Alt text");
    ClearOptions();

    let object=document.getElementById("FocusedObject");
    object.style.pointerEvents="none";
    
    ShowMessage("You have solved the puzzle and found a key inside the box. You can now leave the room.");
    AddOption("Close Box",()=>{
        HideObject(),
        HideMessage(),
        ClearOptions(),
        ShowMessage("There is nothing left to do here."),
        AddOption("Inventory",console.log("Inventory")),
        AddOption("Leave Room",TransitionToRoom(6));
    });
}

function ClearObject(){
    let object=document.getElementById("FocusedObject");
    object.innerHTML="";
}

function RemoveOption(OptionTitle){
    let Options = document.getElementById("UserOptions").children;
    for (let i=0;i<Options.length;i++){
        if (Options[i].textContent==OptionTitle){
            Options[i].remove();
        }else{
            continue;
        }
    }

}

/**
 * Main Function which is called when room page is loaded
 */
function StartRoom() {
    
    
    AddOption("Show Messsage", () => ShowMessage(RoomDescription))
    AddOption("Hide Message", HideMessage)
    AddOption("Investigate the box", () => ShowObject(`https://imgs.search.brave.com/Uv7PjPwToss4YP4krNPTTauC8y1Iq7BXFAWSoknkpAI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTEv/ODE0LzU2Ny9zbWFs/bC9yb2xsLW9mLXll/bGxvdy1zY290Y2gt/dGFwZS0zZC1oaWdo/LXF1YWxpdHktcGhv/dG8tcG5nLnBuZw`,"Alt text"))
    
//  LEFTOVER OPTIONS
//  ||||||||||||||||
//  vvvvvvvvvvvvvvvv
    
    //AddOption("Set box down", () => HideObject())
    // AddOption("Clear Options", () => ClearOptions("You may not make an action now"))
    // AddOption("Clear Options", () => ClearOptions())
    
    //AddOption("Leave Room",)

    //AddOption("Add Energy", () => AddEnergy(5))
    //AddOption("Remove Energy", () => RemoveEnergy(5))
    
    
    // AddOption("DB Test", () => {
    //     executeDatabaseQuery("SELECT * FROM testUsers").then((result) => {
    //         console.log(result)
    //     })
    // })
    //SetBackgroundImage("/Assets/scaryimageREMOVE--------------------------.webp")
    SetRoomName("Living Room")
}